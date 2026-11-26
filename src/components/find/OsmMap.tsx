import { ComponentType, Ref, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { WebView as RNWebView, WebViewMessageEvent, WebViewProps } from "react-native-webview";

import { colors } from "../../constants/theme";
import { formatKm } from "../../lib/find/centres";
import type { MapCanvasProps } from "./mapTypes";

// The library's class types don't line up with this React Native version's types; the runtime is fine.
type WebViewHandle = { injectJavaScript: (js: string) => void };
const WebView = RNWebView as unknown as ComponentType<WebViewProps & { ref?: Ref<WebViewHandle> }>;

/**
 * Real, moveable map without a Google Maps key: OpenStreetMap tiles drawn by Leaflet inside a WebView.
 * Used on Android builds that have no GOOGLE_MAPS_ANDROID_API_KEY. Same pins and behaviour as the Google map:
 * letter bubbles with distance, tap to select, the person's blue dot, and it frames the nearest centres.
 * Needs internet (map tiles); the © OpenStreetMap credit in the corner is required by its licence.
 */
export default function OsmMap({ centres, selectedId, user, onSelect, bottomInset, topInset }: MapCanvasProps) {
  const ref = useRef<WebViewHandle>(null);
  const [ready, setReady] = useState(false);

  const data = useMemo(
    () => ({
      centres: centres.map((c) => ({ id: c.id, lat: c.lat, lng: c.lng, initial: c.initial, tone: c.tone, km: c.km !== null ? formatKm(c.km) : null })),
      selectedId,
      user,
      pad: { top: topInset + 40, bottom: bottomInset + 30 },
    }),
    [centres, selectedId, user, topInset, bottomInset],
  );

  // Push every change into the page once it has loaded.
  useEffect(() => {
    if (!ready) return;
    ref.current?.injectJavaScript(`window.bloomUpdate(${JSON.stringify(data)}); true;`);
  }, [ready, data]);

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data) as { type: string; id?: string };
      if (msg.type === "ready") setReady(true);
      if (msg.type === "select" && msg.id) onSelect(msg.id);
    } catch {
      // ignore
    }
  };

  return (
    <View style={styles.map}>
      <WebView
        ref={ref}
        originWhitelist={["*"]}
        source={{ html: HTML, baseUrl: "https://bloom.local/" }}
        onMessage={onMessage}
        onLoadEnd={() => setReady(true)}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        overScrollMode="never"
        style={styles.web}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  map: { position: "absolute", left: 0, top: 0, right: 0, bottom: 0, backgroundColor: "#EEF0F3" },
  web: { flex: 1, backgroundColor: "transparent" },
});

const HTML = `<!doctype html><html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html,body,#map{margin:0;height:100%;width:100%;background:#EEF0F3;font-family:-apple-system,Roboto,sans-serif}
  .pin{display:flex;flex-direction:column;align-items:center}
  .b{width:46px;height:46px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;
     font-weight:800;font-size:19px;color:${colors.trackInk};box-shadow:0 2px 6px rgba(0,0,0,.18);box-sizing:border-box}
  .sel .b{width:56px;height:56px;border:4px solid ${colors.purple}}
  .km{margin-top:-8px;background:#fff;border-radius:10px;padding:2px 8px;font-weight:700;font-size:11px;color:${colors.trackInk};box-shadow:0 1px 3px rgba(0,0,0,.15)}
  .sel .km{background:${colors.purple};color:#fff}
  .me{width:20px;height:20px;border-radius:50%;background:#1B6FE5;border:3px solid #fff;box-shadow:0 0 0 10px rgba(27,111,229,.22)}
  .leaflet-div-icon{background:none;border:none}
</style></head><body><div id="map"></div><script>
  var post=function(m){window.ReactNativeWebView&&window.ReactNativeWebView.postMessage(JSON.stringify(m))};
  var map=L.map('map',{zoomControl:false,attributionControl:true}).setView([9.0765,7.3986],12);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  var layer=L.layerGroup().addTo(map), me=null, fitted=false, lastSel=null;
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  window.bloomUpdate=function(d){
    layer.clearLayers();
    d.centres.forEach(function(c){
      var sel=c.id===d.selectedId;
      var html='<div class="pin'+(sel?' sel':'')+'"><div class="b" style="background:'+esc(c.tone)+'">'+esc(c.initial)+'</div>'+(c.km?'<div class="km">'+esc(c.km)+'</div>':'')+'</div>';
      var m=L.marker([c.lat,c.lng],{icon:L.divIcon({html:html,className:'',iconSize:[64,76],iconAnchor:[32,32]}),zIndexOffset:sel?1000:0});
      m.on('click',function(){post({type:'select',id:c.id})});
      layer.addLayer(m);
    });
    if(d.user){
      var ll=[d.user.latitude,d.user.longitude];
      if(!me){me=L.marker(ll,{icon:L.divIcon({html:'<div class="me"></div>',className:'',iconSize:[26,26],iconAnchor:[13,13]}),interactive:false}).addTo(map)} else me.setLatLng(ll);
    }
    var pad={paddingTopLeft:[50,d.pad.top],paddingBottomRight:[50,d.pad.bottom]};
    if(!fitted){
      var pts=(d.user?[[d.user.latitude,d.user.longitude]]:[]).concat(d.centres.slice(0,3).map(function(c){return [c.lat,c.lng]}));
      if(pts.length>1){map.fitBounds(pts,pad)} else if(pts.length===1){map.setView(pts[0],13)}
      if(d.user)fitted=true;
    }
    if(d.selectedId!==lastSel){
      var s=d.centres.filter(function(c){return c.id===d.selectedId})[0];
      if(s&&lastSel!==null)map.panTo([s.lat,s.lng]);
      lastSel=d.selectedId;
    }
  };
  post({type:'ready'});
</script></body></html>`;
