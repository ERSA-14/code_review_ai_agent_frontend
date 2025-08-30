import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'custom-light': '#f8fafc',
        'custom-dark-primary': '#0f172a',
        'custom-dark-secondary': '#1e293b',
        'custom-accent': '#3b82f6',
      },
    },
  },
  plugins: [],
} satisfies Config;
