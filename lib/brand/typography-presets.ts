/**
 * Typography colour presets for the Banner Generator.
 * Used by TypographyColorPicker for T1 and T2 text colours.
 */

export interface TypographyColorPreset {
  readonly id:         string;
  readonly labelVi:    string;
  readonly hex:        string;
  readonly isDefault?: boolean;
}

export const TYPOGRAPHY_PRESET_LIST: readonly TypographyColorPreset[] = [
  { id: "white",         labelVi: "Trắng",        hex: "#FFFFFF", isDefault: true },
  { id: "zalopay-blue",  labelVi: "Xanh ZaloPay",  hex: "#0033C9" },
  { id: "zalopay-green", labelVi: "Xanh lá",       hex: "#00CF6A" },
  { id: "dark-navy",     labelVi: "Xanh đậm",      hex: "#001B4A" },
  { id: "black",         labelVi: "Đen",           hex: "#111111" },
  { id: "yellow",        labelVi: "Vàng",          hex: "#FFD84D" },
];

export const T_COLOR_DEFAULT   = "#FFFFFF";
export const T_OPACITY_DEFAULT = 100;

export function findTypographyPresetByHex(hex: string): TypographyColorPreset | undefined {
  return TYPOGRAPHY_PRESET_LIST.find(
    (p) => p.hex.toUpperCase() === hex.toUpperCase(),
  );
}
