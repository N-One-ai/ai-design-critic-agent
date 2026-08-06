export interface BrandGuidelineColors {
  primary?: { hex: string; name?: string };
  secondary?: { hex: string; name?: string };
  accent?: { allowedColors?: string[] };
}

export interface BrandGuidelineLogo {
  primaryLogo?: string;
  referenceImages?: string[];
  deprecatedAssets?: string[];
  rules?: {
    mustAppear?: boolean;
    preferredPositions?: string[];
  };
}

export interface BrandGuidelineTrademark {
  variants?: (string | { file: string })[];
}

export interface BrandGuideline {
  brandName?: string;
  tone?: string[];
  colors?: BrandGuidelineColors;
  typography?: {
    headingFont?: string;
    bodyFont?: string;
  };
  brandRules?: {
    colorBalance?: Record<string, number>;
    minimumContrast?: number | string;
  };
  logo?: BrandGuidelineLogo;
  trademark?: BrandGuidelineTrademark;
}

export interface CategoryScore {
  score?: number | null;
  conclusion?: string;
}

export interface TypographyMatch {
  overall: boolean;
  characters?: Record<string, boolean>;
  reason?: string;
}

export interface LogoChecks {
  logoPresent?: boolean;
  correctBrand?: boolean;
  correctLogo?: boolean;
  approvedVersion?: boolean;
  notDistorted?: boolean;
  correctColors?: boolean;
  correctPosition?: boolean;
  sufficientProminence?: boolean;
}

export interface LogoComplianceCategory extends CategoryScore {
  detectedBrand?: string | null;
  logoVersion?: string | null;
  reason?: string;
  typographyMatch?: TypographyMatch;
  checks?: LogoChecks;
}

export interface TrademarkChecks {
  variantMatch?: boolean;
  colorMatch?: boolean;
  positionMatch?: boolean;
  prominenceMatch?: boolean;
}

export interface TrademarkComplianceCategory extends CategoryScore {
  detected?: boolean;
  type?: "explicit" | "watermark" | "none";
  confidence?: number;
  matchedVariant?: string | null;
  checks?: TrademarkChecks;
  complianceScore?: number | null;
}

export interface CtaEvaluationCategory extends CategoryScore {
  ctaFound?: boolean;
  ctaText?: string | null;
  ctaClarity?: string;
  ctaPlacement?: string;
}

export interface AnalysisCategories {
  logoCompliance?: LogoComplianceCategory;
  trademarkCompliance?: TrademarkComplianceCategory;
  colorCompliance?: CategoryScore;
  typographyCompliance?: CategoryScore;
  visualHierarchy?: CategoryScore;
  layout?: CategoryScore;
  ctaEvaluation?: CtaEvaluationCategory;
}

export interface AiRedesignPrompt {
  chatgptPrompt?: string;
  geminiPrompt?: string;
}

export interface AnalysisResult {
  designName?: string;
  overallScore?: number | null;
  categories?: AnalysisCategories;
  summary?: string;
  strengths?: string[];
  mainIssues?: string[];
  improvementSuggestions?: string[];
  aiRedesignPrompt?: AiRedesignPrompt;
  assets?: {
    referenceLogo?: string | null;
    officialLogos?: (string | null)[];
    deprecatedLogos?: (string | null)[];
    trademarkVariants?: (string | null)[];
    matchedTrademark?: string | null;
  };
  report?: string;
  _parseError?: boolean;
}

export interface CompareCategories {
  visualImpact?: CompareCategory;
  brandCompliance?: CompareCategory;
  logoVisibility?: CompareCategory;
  typography?: CompareCategory;
  colorUsage?: CompareCategory;
}

export interface CompareCategory {
  myScore?: number | null;
  competitorScore?: number | null;
  winner?: "my" | "competitor" | "tie";
  conclusion?: string;
}

export interface CompareResult {
  myDesignName?: string;
  competitorDesignName?: string;
  categories?: CompareCategories;
  overallWinner?: "my" | "competitor" | "tie";
  summary?: string;
  mainIssues?: string[];
  recommendations?: string[];
  report?: string;
  _parseError?: boolean;
}

export type AnalysisStatus = "idle" | "loading" | "done" | "error";

// ── Banner Generator ──────────────────────────────────────────────────────────

export type BannerHeroStyle    = "Modern" | "Minimal" | "Bold" | "Festive" | "Corporate";
export type BannerTaglineAlign = "left" | "center" | "right";
export type HeroMaskStyle      = "RoundedRect" | "SoftOrganic" | "WaveBottom" | "LargeRadiusCard";
/** Official Zalopay logo variants. Extend in lib/assets/logo-assets.ts. */
export type LogoVariant        = "primary" | "white";

export interface BannerTemplateValues {
  tagline1: string;           // Label rendered in blue pill
  tagline2: string;           // Main headline — use \n for line break (max 2 lines)
  campaignName: string;       // Campaign context for AI prompt
  product: string;            // Hero subject — what to generate
  audience: string;           // Target audience context for AI prompt
  heroStyle: BannerHeroStyle;
  heroPromptOverride: string; // Optional: bypass AI prompt builder
  // Typography overrides — undefined means "use brand default"
  t1FontSize?:       number;               // Tagline 1 font size (default: 32, range: 20–48)
  t2FontSize?:       number;               // Tagline 2 font size (default: 80, range: 48–120)
  t1TextTransform?:  "none" | "uppercase"; // default: "none" (preserve input as-is)
  t1Align?:          BannerTaglineAlign;   // default: "center"
  t2Align?:          BannerTaglineAlign;   // default: "center"
  heroMaskStyle?:    HeroMaskStyle;        // default: "RoundedRect"
  heroBlend?:        number;               // 0–100, default: 40
  blendColor?:       string;               // CSS hex, default: "#00CF6A"
  logoVariant?:      LogoVariant;          // default: "white"
  // Typography colour overrides (undefined → brand white default)
  t1Color?:          string;               // CSS hex, default: "#FFFFFF"
  t1ColorOpacity?:   number;               // 0–100, default: 100
  t2Color?:          string;               // CSS hex, default: "#FFFFFF"
  t2ColorOpacity?:   number;               // 0–100, default: 100
  // Trademark Z watermark
  zEnabled?:         boolean;              // default: true
  zOpacity?:         number;               // 0–25 (percent), default: 10
  zScale?:           number;               // 70–120, default: 100
  zColor?:           string;               // CSS hex; undefined = auto (follows blendColor)
}

// Legacy — kept so old localStorage history items still deserialise cleanly
export interface BannerFormValues {
  campaignObjective: string;
  promotion: string;
  brand: string;
  targetAudience: string;
  platform: string;
  language: string;
  dimensions: { width: number; height: number };
  visualStyle: string;
  referenceImageDataUrl?: string;
}

export interface BannerResult {
  generationId: string;
  imageDataUrl: string;       // Full composite banner from canvas export
  heroImageUrl?: string;      // AI-generated hero image URL
  prompt: string;             // Prompt used for hero generation
  negativePrompt?: string;
  dimensions: { width: number; height: number };
  // Template fields
  tagline1?: string;
  tagline2?: string;
  campaignName?: string;
  product?: string;
  heroStyle?: string;
  // Hero image transform (canvas-space pixels / scale factor)
  heroOffsetX?: number;
  heroOffsetY?: number;
  heroScale?:   number;
  // Hero blend effect (0–100)
  heroBlend?:   number;
  // Blend overlay colour (CSS hex)
  blendColor?:       string;
  // Logo variant
  logoVariant?:      LogoVariant;
  // Typography text colours
  t1Color?:          string;
  t1ColorOpacity?:   number;
  t2Color?:          string;
  t2ColorOpacity?:   number;
  // Trademark Z watermark
  zEnabled?:         boolean;
  zOpacity?:         number;
  zScale?:           number;
  zColor?:           string;
  // Legacy fields — kept for old history items
  platform?: string;
  visualStyle?: string;
  campaignObjective?: string;
  promotion?: string;
  brand?: string;
  createdAt: string;
}

export type BannerStatus = "idle" | "loading" | "done" | "error";
