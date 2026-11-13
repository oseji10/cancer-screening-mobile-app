// Central place for backend settings. Set the API URL in a `.env` file at the
// project root:  EXPO_PUBLIC_API_URL=https://your-ncsr-api.example/api
// (no trailing slash, and it must end in /api). Expo inlines EXPO_PUBLIC_*
// variables at build time, so rebuild the app after changing it.

const apiUrl = (process.env.EXPO_PUBLIC_API_URL ?? "https://CHANGE-ME.example/api").replace(/\/+$/, "");

export const config = {
  apiUrl,

  /**
   * False until EXPO_PUBLIC_API_URL is set. While false, Find shows the built-in
   * SAMPLE centres so the app still works offline in development; once true it
   * only ever shows real centres from the NCSR backend.
   */
  hasBackend: !apiUrl.includes("CHANGE-ME"),

  // Bloom mobile API (see BLOOM-SETUP.md in the Laravel project).
  bloomPath: "/bloom",

  // TODO: confirm against the NCSR backend before turning on.
  riskAssessmentPath: "/risk-assessments", // POST the finished answers

  // Keep false until riskAssessmentPath exists on the backend; the flow then
  // finishes locally instead of calling the API.
  submitRiskAssessment: false,
  // Optional: link to the self-breast-exam video. When empty the play button does nothing yet.
  sbeVideoUrl: "",
};
