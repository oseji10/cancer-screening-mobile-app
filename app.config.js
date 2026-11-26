/**
 * Extends app.json at build time.
 * Google Maps (Find centres, Android) needs an API key. It is kept out of the repo: set it as an EAS
 * environment variable called GOOGLE_MAPS_ANDROID_API_KEY (see BLOOM setup notes). Without it the
 * Find screen shows a drawn map instead of crashing.
 */
module.exports = ({ config }) => {
  const key = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    plugins: [...(config.plugins ?? []), ...(key ? [["react-native-maps", { androidGoogleMapsApiKey: key }]] : [])],
    extra: { ...(config.extra ?? {}), hasGoogleMapsKey: Boolean(key) },
  };
};
