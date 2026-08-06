export interface ZTrademarkColorPreset {
  readonly id:      string;
  readonly labelVi: string;
  readonly hex:     string;
}

export const Z_COLOR_PRESETS: readonly ZTrademarkColorPreset[] = [
  { id: "white",        labelVi: "Trắng",        hex: "#FFFFFF" },
  { id: "zalopay-green",labelVi: "Xanh lá",      hex: "#00CF6A" },
  { id: "zalopay-blue", labelVi: "Xanh ZaloPay", hex: "#0033C9" },
  { id: "dark-navy",    labelVi: "Xanh đậm",     hex: "#001B4A" },
  { id: "blue-light",   labelVi: "Xanh nhạt",    hex: "#B8C7FF" },
  { id: "yellow",       labelVi: "Vàng",         hex: "#FFD84D" },
];
