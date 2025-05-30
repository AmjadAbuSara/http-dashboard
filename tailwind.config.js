export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        "dashboard-accent": "#4F8EF7",
        "dashboard-bg": "#181B23",
        "dashboard-card": "#23263A",
        "dashboard-text": "#F5F6FA",
        "dashboard-error": "#F44336",
        "dashboard-success": "#4CAF50",
        "dashboard-warning": "#F5A524",
        "dashboard-highlight": "#FFD54F" // 🔥 Added
      }
    }
  },
  darkMode: "class",
  plugins: [],
}
