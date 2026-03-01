/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        "radar-bg": "#0A0E1A",
        "radar-surface": "#111827",
        "radar-border": "#1F2937",
        "radar-primary": "#6366F1",
        "radar-accent": "#10B981",
        "radar-warning": "#F59E0B",
        "radar-danger": "#EF4444",
        "radar-text": "#F9FAFB",
        "radar-muted": "#6B7280"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular"]
      },
      boxShadow: {
        soft: "0 10px 30px rgba(2,6,23,0.35)",
        glow: "0 0 0 1px rgba(99,102,241,0.35), 0 20px 60px rgba(15,23,42,0.45)"
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
