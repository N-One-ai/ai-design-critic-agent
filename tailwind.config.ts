import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./contexts/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* ── Background ── */
        "bg-base":      "var(--bg-base)",
        "bg-surface":   "var(--bg-surface-1)",
        "bg-surface-2": "var(--bg-surface-2)",
        "bg-surface-3": "var(--bg-surface-3)",

        /* ── Foreground ── */
        "fg-default":  "var(--fg-default)",
        "fg-muted":    "var(--fg-muted)",
        "fg-subtle":   "var(--fg-subtle)",
        "fg-disabled": "var(--fg-disabled)",
        "fg-inverted": "var(--fg-inverted)",

        /* ── Border ── */
        "border-default": "var(--border-default)",
        "border-strong":  "var(--border-strong)",
        "border-subtle":  "var(--border-subtle)",

        /* ── Brand ── */
        brand: {
          DEFAULT: "var(--brand-default)",
          hover:   "var(--brand-hover)",
          active:  "var(--brand-active)",
          subtle:  "var(--brand-subtle)",
          fg:      "var(--brand-fg)",
        },

        /* ── Accent ── */
        accent: {
          DEFAULT: "var(--accent-default)",
          hover:   "var(--accent-hover)",
          subtle:  "var(--accent-subtle)",
          fg:      "var(--accent-fg)",
        },

        /* ── Semantic ── */
        success: {
          DEFAULT: "var(--success-default)",
          subtle:  "var(--success-subtle)",
          fg:      "var(--success-fg)",
        },
        warning: {
          DEFAULT: "var(--warning-default)",
          subtle:  "var(--warning-subtle)",
          fg:      "var(--warning-fg)",
        },
        danger: {
          DEFAULT: "var(--danger-default)",
          subtle:  "var(--danger-subtle)",
          fg:      "var(--danger-fg)",
        },
        info: {
          DEFAULT: "var(--info-default)",
          subtle:  "var(--info-subtle)",
          fg:      "var(--info-fg)",
        },

        /* ── Backward compat ── */
        background:          "var(--background)",
        surface:             "var(--surface)",
        "surface-secondary": "var(--surface-secondary)",
        foreground:          "var(--foreground)",
        muted:               "var(--muted)",
        primary: {
          DEFAULT: "var(--primary)",
          hover:   "var(--primary-hover)",
        },
      },

      borderRadius: {
        xs:   "var(--radius-xs)",
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
        card: "14px",
      },

      boxShadow: {
        1:       "var(--shadow-1)",
        2:       "var(--shadow-2)",
        3:       "var(--shadow-3)",
        hover:   "var(--shadow-hover)",
        modal:   "var(--shadow-modal)",
        card:    "0 1px 3px rgba(0,0,0,0.06)",
        dropdown: "0 8px 24px rgba(16,24,40,0.12)",
      },

      transitionDuration: {
        fast:   "150ms",
        normal: "250ms",
        slow:   "400ms",
      },

      transitionTimingFunction: {
        ease: "cubic-bezier(0.4, 0, 0.2, 1)",
        spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      spacing: {
        "ds-1":  "4px",
        "ds-2":  "8px",
        "ds-3":  "12px",
        "ds-4":  "16px",
        "ds-5":  "24px",
        "ds-6":  "32px",
        "ds-7":  "40px",
        "ds-8":  "48px",
        "ds-9":  "64px",
        "ds-10": "80px",
      },

      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },

      animation: {
        "spin-slow":       "spin 1.2s linear infinite",
        "fade-in":         "fadeIn 250ms cubic-bezier(0.4,0,0.2,1) both",
        "slide-up":        "slideUp 250ms cubic-bezier(0.4,0,0.2,1) both",
        "slide-down":      "slideDown 250ms cubic-bezier(0.4,0,0.2,1) both",
        "pulse-skeleton":  "pulse-skeleton 1.5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
