const ZALOPAY_COLORS = {
  blue: "#0033C9",
  green: "#00CF6A",
  orange: "#FF8A00",
  red: "#FF4D4F",
  alertRed: "#EF4444",
};

const STATUS_COLORS: Record<string, string> = {
  success: ZALOPAY_COLORS.green,
  warning: ZALOPAY_COLORS.orange,
  danger: ZALOPAY_COLORS.alertRed,
};

function lucideIcon(name: string, status: string, size = 18): string {
  const color = STATUS_COLORS[status] || status;
  return `<i data-lucide="${name}" class="checklist-icon" style="color:${color};width:${size}px;height:${size}px;" stroke-width="2" aria-hidden="true"></i>`;
}

export const ICONS = {
  mainIssues: () => lucideIcon("alert-triangle", "danger"),
  mainIssueItem: () => lucideIcon("alert-triangle", "danger"),
  improvementSuggestions: () => lucideIcon("lightbulb", "success"),
  improvementItem: () => lucideIcon("lightbulb", "success"),

  redesignPrompt: () => lucideIcon("sparkles", "success"),
  chatgptPrompt: () => lucideIcon("bot", "success"),
  geminiPrompt: () => lucideIcon("bot", "success"),

  checklistSuccess: () => lucideIcon("circle-check-big", "success"),
  checklistFailure: () => lucideIcon("circle-x", "danger"),
  checklistWarning: () => lucideIcon("alert-triangle", "warning"),

  confidenceMetric: () => lucideIcon("gauge", "success"),
  variantMetric: () => lucideIcon("file-check", "success"),

  variantMatchIcon: (status: string) => lucideIcon("shapes", status),
  colorMatchIcon: (status: string) => lucideIcon("paint-bucket", status),
  positionMatchIcon: (status: string) => lucideIcon("layout-grid", status),
  prominenceMatchIcon: (status: string) => lucideIcon("eye", status),

  chevronDown: () => lucideIcon("chevron-down", "#9aa3b2"),
  chevronRight: () => lucideIcon("chevron-right", "#9aa3b2"),
  copyAction: () => lucideIcon("copy", ZALOPAY_COLORS.blue),
};

export { ZALOPAY_COLORS, STATUS_COLORS };
