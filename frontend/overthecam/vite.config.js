import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default defineConfig({
  base: "/", // 기본 URL 설정
  plugins: [react()],
  css: {
    postcss: {
      plugins: [tailwindcss, autoprefixer],
    },
  },
  define: {
    global: "globalThis",
  },
  assetsInclude: ["**/*.ttf", "**/*.otf"], // 🔥 폰트 파일 포함 설정 추가
});