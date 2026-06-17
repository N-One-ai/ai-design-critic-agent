import { CATEGORY_KEYS, REPORT_SECTION_KEYS, COMPARE_CATEGORY_KEYS } from "./promptBuilder.js";
import { ICONS } from "./icons.js";

const CATEGORY_LABELS = {
  logoCompliance: "Quy chuẩn sử dụng logo",
  trademarkCompliance: "Quy chuẩn trademark Z",
  colorCompliance: "Màu sắc thương hiệu",
  typographyCompliance: "Font chữ thương hiệu",
  visualHierarchy: "Thứ bậc thị giác",
};

const LOGO_CHECK_LABELS = {
  logoPresent: "Phát hiện logo",
  correctBrand: "Đúng thương hiệu",
  correctLogo: "Logo ZaloPay chính thức",
  approvedVersion: "Phiên bản được chấp thuận",
  notDistorted: "Không bị biến dạng",
  correctColors: "Không đổi màu trái phép",
  correctPosition: "Đúng vị trí",
  sufficientProminence: "Đủ nổi bật",
};

const TRADEMARK_CHECK_LABELS = {
  variantMatch: "Đúng hình dạng biểu tượng",
  colorMatch: "Dùng màu được phép",
  positionMatch: "Bố cục phù hợp",
  prominenceMatch: "Đủ nổi bật",
};

const THUMBNAIL_STYLE = "height:36px;width:auto;background:#fff;border:1px solid #e0e0e0;border-radius:6px;padding:2px 4px;vertical-align:middle;display:inline-block;";

function renderAssetThumbnail(file, assetMap) {
  if (!file) return "";
  const dataUrl = assetMap?.[file];
  if (!dataUrl) return "";
  return `<img src="${dataUrl}" alt="" style="${THUMBNAIL_STYLE}" />`;
}

function renderLogoDetection(category, assetMap) {
  const items = [];

  if (typeof category.checks?.logoPresent === "boolean") {
    if (category.checks.logoPresent) {
      items.push(`<li class="status-item">${ICONS.checklistSuccess()}Logo được phát hiện</li>`);
    } else {
      items.push(`<li class="status-item">${ICONS.checklistFailure()}Không phát hiện logo</li>`);
    }
  }

  if (category.detectedBrand != null) {
    const isZaloPay = category.detectedBrand === "ZaloPay";
    const icon = isZaloPay ? ICONS.checklistSuccess() : ICONS.checklistFailure();
    items.push(`<li class="metric-item">${icon}Thương hiệu nhận diện: <strong>${category.detectedBrand}</strong></li>`);
  }

  if (typeof category.checks?.correctBrand === "boolean") {
    const icon = category.checks.correctBrand ? ICONS.checklistSuccess() : ICONS.checklistFailure();
    const label = category.checks.correctBrand ? "Đúng thương hiệu (ZaloPay)" : "Sai thương hiệu";
    items.push(`<li class="status-item">${icon}${label}</li>`);
  }

  if (category.logoVersion != null) {
    const isCurrent = category.logoVersion === "Current Official Logo";
    const icon = isCurrent ? ICONS.checklistSuccess() : ICONS.checklistFailure();
    const VERSION_LABELS = {
      "Current Official Logo": "Logo chính thức hiện hành",
      "Deprecated": "Logo deprecated — vi phạm Brand Guideline",
      "Old Logo Version": "Logo phiên bản cũ — vi phạm Brand Guideline",
      "Modified Logo": "Logo đã bị chỉnh sửa — vi phạm Brand Guideline",
      "Unknown Logo": "Không xác định được phiên bản logo",
    };
    const label = VERSION_LABELS[category.logoVersion] || category.logoVersion;
    items.push(`<li class="metric-item">${icon}Phiên bản logo: <strong>${label}</strong></li>`);
  }

  if (category.reason) {
    items.push(`<li class="metric-item" style="font-style:italic">${ICONS.checklistFailure()}${category.reason}</li>`);
  }

  const typo = category.typographyMatch;
  if (typo) {
    const typoIcon = typo.overall ? ICONS.checklistSuccess() : ICONS.checklistFailure();
    items.push(`<li class="metric-item">${typoIcon}Typography wordmark: <strong>${typo.overall ? "Khớp chính thức" : "Không khớp"}</strong></li>`);
    if (typo.characters) {
      const charItems = Object.entries(typo.characters)
        .map(([char, match]) => {
          const icon = match ? ICONS.checklistSuccess() : ICONS.checklistFailure();
          return `<li class="check-item" style="margin-left:1.25em">${icon}<code>${char}</code></li>`;
        })
        .join("\n");
      items.push(charItems);
    }
    if (!typo.overall && typo.reason) {
      items.push(`<li class="metric-item" style="margin-left:1.25em;font-style:italic">${typo.reason}</li>`);
    }
  }

  if (typeof category.checks?.correctLogo === "boolean") {
    const icon = category.checks.correctLogo ? ICONS.checklistSuccess() : ICONS.checklistFailure();
    const label = category.checks.correctLogo ? "Logo chính thức — đã xác minh" : "Logo chính thức — FAIL";
    const officialLogoKey = Object.keys(assetMap || {}).find(
      (k) => !k.includes("old") && !k.includes("deprecated") && k.includes("logo")
    );
    const thumbnail = category.checks.correctLogo && officialLogoKey
      ? renderAssetThumbnail(officialLogoKey, assetMap)
      : "";
    items.push(`<li class="check-item">${icon}${label}${thumbnail ? `<br>${thumbnail}` : ""}</li>`);
  }

  if (typeof category.checks?.approvedVersion === "boolean") {
    const icon = category.checks.approvedVersion ? ICONS.checklistSuccess() : ICONS.checklistFailure();
    const label = category.checks.approvedVersion ? "Phiên bản được chấp thuận" : "Phiên bản được chấp thuận — FAIL";
    items.push(`<li class="check-item">${icon}${label}</li>`);
  }

  if (items.length === 0) return "";
  return `**Kết quả nhận diện logo:**\n\n<ul class="checklist">\n${items.join("\n")}\n</ul>\n`;
}

export function computeOverallScore(categories) {
  const scores = CATEGORY_KEYS
    .map((key) => categories?.[key]?.score)
    .filter((score) => typeof score === "number");

  if (scores.length === 0) return null;

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  return Math.round(average * 10) / 10;
}

function renderTrademarkDetection(category, assetMap) {
  const items = [];

  if (typeof category.detected === "boolean") {
    if (category.type === "watermark") {
      items.push(`<li class="status-item">${ICONS.checklistSuccess()}Đã nhận diện watermark Z</li>`);
    } else if (category.detected) {
      items.push(`<li class="status-item">${ICONS.checklistSuccess()}Đã nhận diện: Có</li>`);
    } else {
      items.push(`<li class="status-item">${ICONS.checklistFailure()}Không phát hiện trademark Z</li>`);
    }
  }
  if (typeof category.confidence === "number") {
    items.push(`<li class="metric-item">${ICONS.confidenceMetric()}Độ tin cậy: ${Math.round(category.confidence * 100)}%</li>`);
  }
  if (category.matchedVariant) {
    const thumbnail = renderAssetThumbnail(category.matchedVariant, assetMap);
    const content = thumbnail
      ? `Đúng phiên bản trademark<br>${thumbnail}`
      : "Đúng phiên bản trademark";
    items.push(`<li class="metric-item">${ICONS.variantMetric()}${content}</li>`);
  }

  if (items.length === 0) return "";
  return `**Kết quả nhận diện:**\n\n<ul class="checklist">\n${items.join("\n")}\n</ul>\n`;
}

function renderChecklist(checks, labels) {
  if (!checks) return "";
  const items = Object.entries(labels).map(([key, label]) => {
    const value = checks[key];
    const icon = value === true ? ICONS.checklistSuccess() : value === false ? ICONS.checklistFailure() : ICONS.checklistWarning();
    return `<li class="check-item">${icon}${label}</li>`;
  });
  return `**Danh sách kiểm tra:**\n\n<ul class="checklist">\n${items.join("\n")}\n</ul>\n`;
}

const TRADEMARK_CHECK_ICONS = {
  variantMatch: ICONS.variantMatchIcon,
  colorMatch: ICONS.colorMatchIcon,
  positionMatch: ICONS.positionMatchIcon,
  prominenceMatch: ICONS.prominenceMatchIcon,
};

function renderTrademarkChecklist(category) {
  const checks = category.checks;
  if (!checks) return "";
  const items = Object.entries(TRADEMARK_CHECK_LABELS).map(([key, label]) => {
    const value = checks[key];
    const getIcon = TRADEMARK_CHECK_ICONS[key];
    if (key === "prominenceMatch" && value === false && category.type === "watermark") {
      return `<li class="check-item">${getIcon("warning")}Độ nổi bật thấp</li>`;
    }
    const status = value === true ? "success" : value === false ? "danger" : "warning";
    return `<li class="check-item">${getIcon(status)}${label}</li>`;
  });
  return `**Danh sách kiểm tra:**\n\n<ul class="checklist">\n${items.join("\n")}\n</ul>\n`;
}

function renderCategory(index, key, category, assetMap) {
  const label = CATEGORY_LABELS[key] || key;

  if (category?.score === null || category?.score === undefined) {
    const conclusion = category?.conclusion ? `\n${category.conclusion}\n` : "";
    return `## ${index}. ${label} — Chưa đánh giá\n${conclusion}`;
  }

  const LOGO_QUALITY_LABELS = {
    notDistorted: LOGO_CHECK_LABELS.notDistorted,
    correctColors: LOGO_CHECK_LABELS.correctColors,
    correctPosition: LOGO_CHECK_LABELS.correctPosition,
    sufficientProminence: LOGO_CHECK_LABELS.sufficientProminence,
  };
  const sections = [
    key === "logoCompliance" ? renderLogoDetection(category, assetMap) : "",
    key === "logoCompliance" && category.checks?.correctLogo === true
      ? renderChecklist(category.checks, LOGO_QUALITY_LABELS)
      : "",
    key === "trademarkCompliance" ? renderTrademarkDetection(category, assetMap) : "",
    key === "trademarkCompliance" ? renderTrademarkChecklist(category) : "",
    category.conclusion ? `${category.conclusion}\n` : "",
  ].filter(Boolean).join("\n");

  return `## ${index}. ${label} — ${category.score}/10\n\n${sections}`;
}

function renderConsolidatedFindings(mainIssues, improvementSuggestions) {
  const lines = [];

  if (mainIssues && mainIssues.length > 0) {
    lines.push(`<h2 class="section-title">${ICONS.mainIssues()}Các vấn đề chính</h2>`);
    lines.push("");
    lines.push('<ul class="checklist">');
    mainIssues.forEach((item) => lines.push(`<li class="issue-item">${ICONS.mainIssueItem()}${item}</li>`));
    lines.push("</ul>");
    lines.push("");
  }

  if (improvementSuggestions && improvementSuggestions.length > 0) {
    lines.push(`<h2 class="section-title">${ICONS.improvementSuggestions()}Đề xuất cải thiện</h2>`);
    lines.push("");
    lines.push('<ul class="checklist">');
    improvementSuggestions.forEach((item) => lines.push(`<li class="improvement-item">${ICONS.improvementItem()}${item}</li>`));
    lines.push("</ul>");
    lines.push("");
  }

  return lines.join("\n");
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function renderPromptCard(label, value, getIcon) {
  return [
    `<div class="prompt-card" data-expanded="false">`,
    `<div class="prompt-card-header">`,
    `<div class="prompt-card-title">${getIcon()}<strong>Prompt cho ${label}</strong></div>`,
    `<div class="prompt-card-meta">${countWords(value)} từ</div>`,
    `<div class="prompt-card-actions">`,
    `<button type="button" class="prompt-action-btn" data-action="copy-prompt" aria-label="Sao chép prompt">${ICONS.copyAction()}</button>`,
    `<button type="button" class="prompt-action-btn prompt-toggle-btn" data-action="toggle-prompt" aria-label="Xem prompt">${ICONS.chevronRight()}${ICONS.chevronDown()}<span class="toggle-label">Xem prompt</span></button>`,
    `</div>`,
    `</div>`,
    `<div class="prompt-card-body hidden"><pre><code>${escapeHtml(value)}</code></pre></div>`,
    `</div>`,
  ].join("\n");
}

function renderAiRedesignPrompt(aiRedesignPrompt) {
  if (!aiRedesignPrompt) return "";

  const lines = [`<h2 class="section-title">${ICONS.redesignPrompt()}Gợi ý cải tiến thiết kế bằng Prompt mới</h2>`, ""];

  const variants = [
    ["ChatGPT", aiRedesignPrompt.chatgptPrompt, ICONS.chatgptPrompt],
    ["Gemini", aiRedesignPrompt.geminiPrompt, ICONS.geminiPrompt],
  ];

  variants.forEach(([label, value, getIcon]) => {
    if (!value) return;
    lines.push(renderPromptCard(label, value, getIcon));
    lines.push("");
  });

  return lines.join("\n");
}

const COMPARE_CATEGORY_LABELS = {
  visualImpact: "Tác động thị giác",
  brandCompliance: "Tuân thủ thương hiệu",
  logoVisibility: "Độ nổi bật logo",
  typography: "Font chữ",
  colorUsage: "Sử dụng màu sắc",
};

const COMPARE_WINNER_LABELS = {
  my: "Của tôi",
  competitor: "Đối thủ",
  tie: "Hòa",
};

export function renderCompareReport(comparison) {
  const lines = [];

  lines.push(`# Báo cáo so sánh thiết kế — ${comparison.myDesignName || "Thiết kế của tôi"} vs ${comparison.competitorDesignName || "Thiết kế đối thủ"}`);
  lines.push("");

  if (comparison.summary) {
    lines.push("## Tóm tắt");
    lines.push("");
    lines.push(comparison.summary);
    lines.push("");
  }

  lines.push("## Bảng so sánh");
  lines.push("");
  lines.push("| Hạng mục | Điểm của tôi | Điểm đối thủ | Bên tốt hơn |");
  lines.push("|---|---|---|---|");

  COMPARE_CATEGORY_KEYS.forEach((key) => {
    const category = comparison.categories?.[key];
    if (!category) return;
    const label = COMPARE_CATEGORY_LABELS[key] || key;
    const myScore = typeof category.myScore === "number" ? `${category.myScore}/10` : "—";
    const competitorScore = typeof category.competitorScore === "number" ? `${category.competitorScore}/10` : "—";
    const winner = COMPARE_WINNER_LABELS[category.winner] || category.winner || "—";
    lines.push(`| ${label} | ${myScore} | ${competitorScore} | ${winner} |`);
  });
  lines.push("");

  if (comparison.overallWinner) {
    lines.push(`**Tổng kết:** ${COMPARE_WINNER_LABELS[comparison.overallWinner] || comparison.overallWinner}`);
    lines.push("");
  }

  lines.push("## Chi tiết theo hạng mục");
  lines.push("");

  COMPARE_CATEGORY_KEYS.forEach((key) => {
    const category = comparison.categories?.[key];
    if (!category) return;
    const label = COMPARE_CATEGORY_LABELS[key] || key;

    lines.push(`### ${label}`);
    lines.push("");

    if (category.conclusion) {
      lines.push(category.conclusion);
      lines.push("");
    }
  });

  const findingsSection = renderConsolidatedFindings(comparison.mainIssues, comparison.recommendations);
  if (findingsSection) {
    lines.push(findingsSection);
  }

  lines.push("---");
  lines.push("_Được tạo bởi AI Design Critic Agent_");

  return lines.join("\n");
}

export function renderMarkdownReport(analysis, overallScore, assetMap = {}) {
  const lines = [];

  lines.push(`# Báo cáo đánh giá thiết kế AI — ${analysis.designName || "Thiết kế chưa có tên"}`);
  lines.push("");
  lines.push(`**Điểm tổng thể:** ${overallScore !== null ? `${overallScore}/10` : "Chưa xác định"}`);
  lines.push("");

  if (analysis.summary) {
    lines.push("## Tóm tắt");
    lines.push("");
    lines.push(analysis.summary);
    lines.push("");
  }

  REPORT_SECTION_KEYS.forEach((key, idx) => {
    lines.push(renderCategory(idx + 1, key, analysis.categories?.[key], assetMap));
    lines.push("");
  });

  const findingsSection = renderConsolidatedFindings(analysis.mainIssues, analysis.improvementSuggestions);
  if (findingsSection) {
    lines.push(findingsSection);
    lines.push("");
  }

  const redesignSection = renderAiRedesignPrompt(analysis.aiRedesignPrompt);
  if (redesignSection) {
    lines.push(redesignSection);
    lines.push("");
  }

  lines.push("---");
  lines.push("_Được tạo bởi AI Design Critic Agent_");

  return lines.join("\n");
}
