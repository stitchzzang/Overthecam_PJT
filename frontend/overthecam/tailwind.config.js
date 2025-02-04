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
        },
        cusPink: {
          DEFAULT: "rgb(255, 210, 210)",
        },
        cusBlue: {
          DEFAULT: "rgb(92, 157, 255)",
        },
        cusLightBlue: {
          DEFAULT: "rgb(182, 212, 253)",
          light: "rgb(200, 230, 255)",
        },
        cusGray: {
          DEFAULT: "rgb(238,238,238)",
        },
        cusYellow: {
          DEFAULT: "rgb(255, 249, 163)",
        },
        cusBlack: {
          DEFAULT: "rgb(33, 33, 33)",
        },
        success: {
          bg: "rgb(182, 212, 253)",
          DEFAULT: "rgb(92, 157, 255)",
        },
        error: {
          bg: "rgb(255, 210, 210)",
          DEFAULT: "rgb(255, 92, 92)",
        },
      },
    }, // 테마 확장
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ], // 플러그인 추가
};
