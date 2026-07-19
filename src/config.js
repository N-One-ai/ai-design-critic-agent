export const config = {
  port: process.env.PORT || 8080,
  llm: {
    apiKey: process.env.OPENROUTER_API_KEY,
    model: process.env.LLM_MODEL || "google/gemma-4-31b-it:free",
  },
  reportLanguage: process.env.REPORT_LANGUAGE || "vi",
  brandGuidelinePath: process.env.BRAND_GUIDELINE_PATH || "./brand-guideline.json",
  logoPath: process.env.LOGO_PATH || "./assets/logo-primary.png",
};
