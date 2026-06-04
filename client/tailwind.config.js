export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      colors: {
        ink: "#18212f",
        panel: "#f8fafc",
        line: "#dbe3ea"
      },
      boxShadow: {
        soft: "0 14px 40px rgba(20, 32, 48, 0.08)"
      }
    }
  },
  plugins: []
};

