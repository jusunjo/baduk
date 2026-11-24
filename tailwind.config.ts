import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        toss: {
          blue: "#3182F6",
          "blue-hover": "#1B64DA",
          ink: "#191F28",
          body: "#4E5968",
          mute: "#8B95A1",
          line: "#E5E8EB",
          soft: "#F2F4F6",
          soft2: "#F9FAFB",
          orange: "#FE9800",
          green: "#03B26C",
          red: "#F04452",
          purple: "#8B5CF6",
        },
      },
      fontFamily: {
        sans: ["Pretendard Variable", "Pretendard", "Outfit Variable", "sans-serif"],
        display: ["Outfit Variable", "Pretendard Variable", "sans-serif"],
      },
      borderRadius: {
        pill: "999px",
      },
      keyframes: {
        "step-in": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-swap": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "15%, 85%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-6px)" },
        },
        "panel-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.12)", opacity: "0.75" },
        },
        "grow-x": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "grow-y": {
          from: { transform: "scaleY(0)" },
          to: { transform: "scaleY(1)" },
        },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        press: {
          "0%, 100%": { transform: "scale(1)" },
          "40%": { transform: "scale(0.97)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%, 60%": { transform: "translateX(-5px)" },
          "40%, 80%": { transform: "translateX(5px)" },
        },
        pop: {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "60%": { opacity: "1", transform: "scale(1.08)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        gasp: {
          "0%, 100%": { opacity: "0.95", transform: "scale(1)" },
          "50%": { opacity: "0.45", transform: "scale(1.12)" },
        },
        "stone-drop": {
          "0%": { opacity: "0", transform: "translateY(-28px) scale(0.7)" },
          "70%": { opacity: "1", transform: "translateY(3px) scale(1.05)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "companion-bob": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },
      },
      animation: {
        "step-in": "step-in 480ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-swap": "fade-swap 2400ms ease-in-out both",
        "panel-in": "panel-in 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "sheet-up": "sheet-up 380ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 200ms ease-out both",
        breathe: "breathe 1800ms ease-in-out infinite",
        "grow-x": "grow-x 650ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "grow-y": "grow-y 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "rise-in": "rise-in 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
        press: "press 420ms ease-out",
        shake: "shake 360ms ease-in-out",
        pop: "pop 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
        gasp: "gasp 900ms ease-in-out infinite",
        "stone-drop": "stone-drop 520ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "companion-bob": "companion-bob 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
