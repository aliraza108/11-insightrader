/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "radar-bg": "#F6F1E8",
        "radar-surface": "#FFFFFF",
        "radar-border": "#E3D8C8",
        "radar-primary": "#0F766E",
        "radar-accent": "#A16207",
        "radar-warning": "#B45309",
        "radar-danger": "#B91C1C",
        "radar-text": "#1F2937",
        "radar-muted": "#6B7280"
      },
      fontFamily: {
        sans: ["Space Grotesk", "ui-sans-serif", "system-ui"],
        mono: ["DM Mono", "ui-monospace", "SFMono-Regular"]
      },
      boxShadow: {
        soft: "0 12px 30px rgba(25, 10, 2, 0.12)",
        glow: "0 0 0 1px rgba(15,118,110,0.2), 0 18px 45px rgba(16,24,40,0.14)"
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" }
        }
      },
      animation: {
        floaty: "floaty 6s ease-in-out infinite",
        shimmer: "shimmer 2s infinite"
      }
    }
  },
  plugins: []
};
