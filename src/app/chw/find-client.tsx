import { Ionicons } from "@expo/vector-icons";
import { Href, useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ChwScreen, ErrorText, PrimaryButton } from "../../components/chw/ui";
import { fonts } from "../../constants/theme";
import { AccessRequest, ClientHit, getMyRequests, requestAccess, searchClients, timeAgo } from "../../lib/chw/access";
import { useChw } from "../../lib/chw/ChwContext";
import { chw } from "../../lib/chw/theme";

const ACCESS_TAG: Record<ClientHit["access"], { text: string; color: string; bg: string } | null> = {
  mine: { text: "Your case", color: chw.teal, bg: chw.tealSoft },
  pending: { text: "Request sent", color: chw.amber, bg: "#FBF3E6" },
  other: { text: "With another health worker", color: chw.muted, bg: chw.card },
  none: null,
};

const STATUS: Record<AccessRequest["status"], { text: string; color: string }> = {
  pending: { text: "Waiting for an admin", color: chw.amber },
  approved: { text: "Approved", color: chw.teal },
  rejected: { text: "Not approved", color: chw.danger },
};

/**
 * Find a woman registered at (or referred to) the health worker's facility and ask an admin for
 * permission to attend to her. Only her name, Client ID, age, LGA and part of her number are shown.
 */
export default function FindClient() {
  const router = useRouter();
  const { live, request, refresh, cases } = useChw();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<ClientHit[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null); // clientId with the reason box open
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const seq = useRef(0);

  const loadRequests = useCallback(async () => {
    try {
      setRequests(await getMyRequests(live, request));
    } catch {
      // the list stays as it was
    }
  }, [live, request]);

  useFocusEffect(
    useCallback(() => {
      void loadRequests();
    }, [loadRequests]),
  );

  // Search as she types (after a short pause).
  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setHits([]);
      setSearched(false);
      setError(null);
      return;
    }
    const mine = ++seq.current;
    setSearching(true);
    const t = setTimeout(async () => {
      try {
        const rows = await searchClients(live, request, term);
        if (mine !== seq.current) return;
        setHits(rows);
        setError(null);
      } catch (e) {
        if (mine !== seq.current) return;
        setError(e instanceof Error ? e.message : "Could not search. Please try again.");
      } finally {
        if (mine === seq.current) {
          setSearching(false);
          setSearched(true);
        }
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q, live, request]);

  const send = async (c: ClientHit) => {
    if (reason.trim().length < 5) {
      setError("Say briefly why you need to attend to her.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      const row = await requestAccess(live, request, c, reason.trim());
      setRequests((r) => [row, ...r.filter((x) => x.id !== row.id)]);
      setHits((rows) => rows.map((h) => (h.clientId === c.clientId ? { ...h, access: "pending" } : h)));
      setOpen(null);
      setReason("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the request.");
    } finally {
      setSending(false);
    }
  };

  const openCase = async (caseId: number | null) => {
    if (!caseId) return;
    if (!cases.some((c) => c.serverId === caseId)) await refresh();
    router.push(`/chw/case/BLM-${String(caseId).padStart(5, "0")}` as Href);
  };

  return (
    <ChwScreen title="Find a client" onBack={() => router.back()}>
      <Text style={s.intro}>Search women registered at your facility or referred to it. To attend to one, ask for access; an admin will approve it.</Text>

      <View style={s.search}>
        <Ionicons name="search" size={18} color={chw.faint} />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Name, Client ID or phone number"
          placeholderTextColor="#A7A2B3"
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search clients"
          style={s.searchInput}
        />
        {searching ? <ActivityIndicator size="small" color={chw.teal} /> : q ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} onPress={() => setQ("")}>
            <Ionicons name="close-circle" size={18} color={chw.faint} />
          </Pressable>
        ) : null}
      </View>

      {error ? <ErrorText>{error}</ErrorText> : null}

      <View style={{ gap: 9, marginTop: 14 }}>
        {searched && !searching && hits.length === 0 && !error ? <Text style={s.empty}>No client at your facility matches “{q.trim()}”.</Text> : null}
        {hits.map((c) => {
          const tag = ACCESS_TAG[c.access];
          const expanded = open === c.clientId;
          return (
            <View key={c.clientId} style={s.card}>
              <View style={s.cardTop}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{c.name.trim().charAt(0).toUpperCase() || "?"}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{c.name}</Text>
                  <Text style={s.meta}>{c.clientId}</Text>
                  <Text style={s.meta}>{[c.age ? `${c.age} years` : null, c.lga, c.phone].filter(Boolean).join(" · ")}</Text>
                </View>
              </View>
              {tag ? (
                <View style={[s.tag, { backgroundColor: tag.bg }]}>
                  <Text style={[s.tagText, { color: tag.color }]}>{tag.text}</Text>
                </View>
              ) : null}

              {c.access === "mine" ? (
                <Pressable accessibilityRole="button" onPress={() => void openCase(c.caseId)} style={s.linkBtn}>
                  <Text style={s.linkText}>Open case</Text>
                </Pressable>
              ) : c.access === "none" || c.access === "other" ? (
                expanded ? (
                  <View style={{ marginTop: 12 }}>
                    <Text style={s.label}>Why do you need to attend to her?</Text>
                    <TextInput
                      value={reason}
                      onChangeText={setReason}
                      placeholder="e.g. She lives in my ward and missed her follow-up"
                      placeholderTextColor="#A7A2B3"
                      multiline
                      maxLength={500}
                      accessibilityLabel="Reason"
                      style={s.reason}
                    />
                    {c.access === "other" ? <Text style={s.note}>Another health worker follows her now. If approved, her case moves to you.</Text> : null}
                    <PrimaryButton label={sending ? "Sending…" : "Send request"} disabled={sending} onPress={() => void send(c)} />
                    <Pressable accessibilityRole="button" onPress={() => { setOpen(null); setReason(""); }} style={s.cancel}>
                      <Text style={s.cancelText}>Cancel</Text>
                    </Pressable>
                  </View>
                ) : (
                  <Pressable accessibilityRole="button" onPress={() => { setOpen(c.clientId); setReason(""); setError(null); }} style={s.linkBtn}>
                    <Text style={s.linkText}>Request access</Text>
                  </Pressable>
                )
              ) : null}
            </View>
          );
        })}
      </View>

      <Text style={s.section}>My requests</Text>
      {requests.length === 0 ? (
        <Text style={s.empty}>You have not asked for access to any client yet.</Text>
      ) : (
        <View style={{ gap: 9 }}>
          {requests.map((r) => {
            const st = STATUS[r.status];
            return (
              <Pressable key={r.id} disabled={r.status !== "approved" || !r.caseId} onPress={() => void openCase(r.caseId)} style={s.reqCard}>
                <View style={{ flex: 1 }}>
                  <Text style={s.name}>{r.clientName ?? r.clientId}</Text>
                  <Text style={s.meta}>{r.clientId} · {timeAgo(r.createdAt)}</Text>
                  <Text style={[s.status, { color: st.color }]}>{st.text}</Text>
                  {r.decisionNote ? <Text style={s.meta}>“{r.decisionNote}”</Text> : null}
                </View>
                {r.status === "approved" && r.caseId ? <Ionicons name="chevron-forward" size={18} color="#A5A2AE" /> : null}
              </Pressable>
            );
          })}
        </View>
      )}
    </ChwScreen>
  );
}

const s = StyleSheet.create({
  intro: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 21, color: chw.muted, marginTop: 4, marginBottom: 14 },
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 50, borderRadius: 25, backgroundColor: chw.card, paddingHorizontal: 16 },
  searchInput: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: chw.text },
  empty: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: chw.muted },
  card: { borderWidth: 1, borderColor: chw.border, borderRadius: 16, padding: 14, backgroundColor: chw.white },
  cardTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: chw.tealLight, alignItems: "center", justifyContent: "center" },
  avatarText: { fontFamily: fonts.bold, fontSize: 16, color: chw.teal },
  name: { fontFamily: fonts.bold, fontSize: 16, color: chw.text },
  meta: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: chw.muted, marginTop: 2 },
  tag: { alignSelf: "flex-start", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginTop: 10 },
  tagText: { fontFamily: fonts.semibold, fontSize: 12 },
  linkBtn: { alignSelf: "flex-start", marginTop: 10, height: 40, borderRadius: 20, paddingHorizontal: 18, borderWidth: 1.5, borderColor: chw.teal, justifyContent: "center" },
  linkText: { fontFamily: fonts.semibold, fontSize: 14, color: chw.teal },
  label: { fontFamily: fonts.semibold, fontSize: 14, color: chw.text, marginBottom: 8 },
  reason: { minHeight: 90, borderWidth: 1, borderColor: chw.border, borderRadius: 14, paddingHorizontal: 14, paddingTop: 12, fontFamily: fonts.regular, fontSize: 15, color: chw.text, textAlignVertical: "top" },
  note: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: chw.amber, marginTop: 8 },
  cancel: { alignSelf: "center", paddingVertical: 12 },
  cancelText: { fontFamily: fonts.semibold, fontSize: 14, color: chw.muted },
  section: { fontFamily: fonts.bold, fontSize: 17, color: chw.ink, marginTop: 28, marginBottom: 10 },
  reqCard: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: chw.card, borderRadius: 16, padding: 14 },
  status: { fontFamily: fonts.semibold, fontSize: 13, marginTop: 6 },
});
