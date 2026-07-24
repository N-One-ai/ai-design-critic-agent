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

export interface AnalysisCategories {
  logoCompliance?: LogoComplianceCategory;
  trademarkCompliance?: TrademarkComplianceCategory;
  colorCompliance?: CategoryScore;
  typographyCompliance?: CategoryScore;
  visualHierarchy?: CategoryScore;
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
