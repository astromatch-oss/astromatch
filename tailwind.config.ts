import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#080911",
        surface: {
          50: "#1E2238",
          100: "#16192E",
          200: "#121426",
          300: "#0D0F1D",
          400: "#090A14",
        },
        cosmic: {
          purple: "#8B5CF6",
          violet: "#7C3AED",
          indigo: "#4F46E5",
          pink: "#EC4899",
          rose: "#F43F5E",
          gold: "#F59E0B",
          starlight: "#FDE047",
          cyan: "#06B6D4",
          teal: "#14B8A6",
        },
        border: "#20243E",
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        }
      },
      backgroundImage: {
        "cosmic-gradient": "linear-gradient(135deg, #121426 0%, #1E1B4B 50%, #0D0F1D 100%)",
        "cosmic-glow": "radial-gradient(ellipse at top, rgba(124, 58, 237, 0.15), transparent 70%), radial-gradient(ellipse at bottom, rgba(236, 72, 153, 0.12), transparent 70%)",
        "card-gradient": "linear-gradient(180deg, rgba(25, 29, 53, 0.75) 0%, rgba(13, 15, 29, 0.9) 100%)",
        "hero-glow": "radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.25) 0%, rgba(244, 63, 94, 0.15) 35%, transparent 70%)",
        "gold-gradient": "linear-gradient(135deg, #F59E0B 0%, #FBBF24 50%, #D97706 100%)",
        "rose-gradient": "linear-gradient(135deg, #F43F5E 0%, #EC4899 50%, #8B5CF6 100%)",
      },
      boxShadow: {
        "cosmic": "0 0 25px -5px rgba(139, 92, 246, 0.3)",
        "cosmic-rose": "0 0 25px -5px rgba(244, 63, 94, 0.35)",
        "cosmic-gold": "0 0 20px -3px rgba(245, 158, 11, 0.35)",
        "card-glow": "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
      },
      animation: {
        "float": "float 6s ease-in-out infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "twinkle": "twinkle 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.2)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        }
      }
    },
  },
  plugins: [],
};

export default config;
