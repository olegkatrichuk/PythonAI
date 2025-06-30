// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    // Указываем, что нужно сканировать все файлы в папках app и components
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {}, // Здесь можно будет добавлять свои цвета, шрифты и т.д.
  },
  plugins: [],
};
export default config;