export const config = {
  llm: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.LLM_MODEL || "gemini-2.0-flash",
    // Fallback models tried in order when the primary hits a quota/rate-limit error
    fallbackModels: (process.env.LLM_FALLBACK_MODELS || "gemini-1.5-flash,gemini-1.5-flash-8b")
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean),
  },
  reportLanguage: process.env.REPORT_LANGUAGE || "vi",
  brandGuidelinePath: process.env.BRAND_GUIDELINE_PATH || "./brand-guideline.json",
  logoPath: process.env.LOGO_PATH || "./assets/logo-primary.png",
};
