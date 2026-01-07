import type { Config } from "tailwindcss";

const config = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        "list-card": "30px 4px 10px 0 rgba(0,0,0,0.25)",
        "grid-card": "30px 2px 10px 0 rgba(0,0,0,0.25)",
      },
    },
  },
} satisfies Config;

export default config;
