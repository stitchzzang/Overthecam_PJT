/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // HTML 파일 경로
    "./src/**/*.{js,jsx,ts,tsx}", // React 컴포넌트 파일 경로
  ],
  theme: {
    extend: {
      colors: {
        cusRed: {
          DEFAULT: "rgb(255, 92, 92)",
          light: "rgb(255, 127, 127)",
        },
        cusPink: {
          DEFAULT: "rgb(255, 210, 210)",
          light: "rgb(255, 214, 214)",
        },
        cusBlue: {
          DEFAULT: "rgb(92, 157, 255)",
          light: "rgb(118, 177, 255)",
          lighter: "rgb(180,212,255)",
        },
        cusLightBlue: {
          DEFAULT: "rgb(182, 212, 253)",
          light: "rgb(200, 230, 255)",
          lighter: "rgb(242,247,255)"
        },
        cusGray: {
          dark: "rgb(225, 225, 225)",
          DEFAULT: "rgb(238,238,238)",
          light: "rgb(245,245,245)",
        },
        cusYellow: {
          DEFAULT: "rgb(255, 249, 163)",
        },
        cusBlack: {
          DEFAULT: "rgb(33, 33, 33)",
          light: "rgb(77, 77, 77)",
        },
        success: {
          DEFAULT: "rgb(128, 230, 98)",
        },
        error: {
          DEFAULT: "rgb(255, 92, 92)",
        },
        btnLightBlue: {
          DEFAULT: "rgb(180,212,255)",
          hover: "rgb(118, 177, 255)",
        },
        btnPink: {
          DEFAULT: "rgb(255, 210, 210)",
          hover: "rgb(252, 160, 160)",
        },
        btnYellow: {
          DEFAULT: "rgb(255, 249, 163)",
          hover: "rgb(252, 243, 121)",
        },
      },
    }, // 테마 확장
  },
  plugins: [require("tailwind-scrollbar-hide")], // 플러그인 추가
};
