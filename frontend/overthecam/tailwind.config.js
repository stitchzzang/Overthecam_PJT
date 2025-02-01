/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html", // HTML 파일 경로
    "./src/**/*.{js,jsx,ts,tsx}", // React 컴포넌트 파일 경로
  ],
  theme: {
    extend: {}, // 테마 확장
  },
  plugins: [], // 플러그인 추가
}
