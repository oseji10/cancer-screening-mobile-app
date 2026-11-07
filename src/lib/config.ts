// Central place for backend settings. Set the API URL in a `.env` file at the
// project root:  EXPO_PUBLIC_API_URL=https://your-ncsr-api.example/api
// (no trailing slash). Expo inlines EXPO_PUBLIC_* variables at build time.

export const config = {
  apiUrl: (process.env.EXPO_PUBLIC_API_URL ?? "https://CHANGE-ME.example/api").replace(/\/+$/, ""),

  // TODO: confirm these routes against `php artisan route:list` on the NCSR backend.
  loginPath: "/auth/login", // Tymon JWT login (POST email + password)
  riskAssessmentPath: "/risk-assessments", // POST the finished answers

  // Keep false until riskAssessmentPath exists on the backend; the flow then
  // finishes locally instead of calling the API.
  submitRiskAssessment: false,
  // Optional: link to the self-breast-exam video. When empty the play button does nothing yet.
  sbeVideoUrl: "",
};
