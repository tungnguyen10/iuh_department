/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/shared/**/*.{html,js}",
    "./src/faculties/**/*.{html,js}",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1120px",
      "2xl": "1280px",
      "3xl": "1536px",
    },
    container: {
      center: true,
      screens: {
        sm: "100%",
        md: "100%",
        lg: "100%",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Roboto", "system-ui", "-apple-system", "sans-serif"],
        inter: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      spacing: {
        30: "110px",
      },
      colors: {
        black: "#616161",
        title: "#212121",
        gray: {
          DEFAULT: "#757575",
          light: "#FAFAFA",
        },
        primary: {
          white: "#FFFFFF",
          yellow: "#F9B200",
          "dark-blue": "#153898",
        },
        secondary: {
          green: "#75C7A3",
          yellow: "#FFE293",
          "yellow-light": "#FEF9E3",
          blue: "#8ED8F8",
          "blue-light": "#E3F6FDFF",
        },
        danger: {
          DEFAULT: "#DD2F2C",
          light: "#FFEBEEFF",
        },
        stroke: "#EEEEEE",
        avatar: {
          pink: "#E91E63",
          purple: "#9C27B0",
          indigo: "#3F51B5",
          cyan: "#00BCD4",
          teal: "#009688",
          "deep-orange": "#FF5722",
          brown: "#795548",
        },
      },
      animation: {
        jelly: "jelly 0.5s ease-in-out",
        pop: "pop 0.3s ease-in-out",
        shake: "shake 0.5s ease-in-out",
        "success-pulse": "success-pulse 0.5s ease-in-out",
        "flash-badge": "flash 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        jelly: {
          "0%, 100%": { transform: "scale(1, 1)" },
          "25%": { transform: "scale(0.9, 1.1)" },
          "50%": { transform: "scale(1.1, 0.9)" },
          "75%": { transform: "scale(0.95, 1.05)" },
        },
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-5px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(5px)" },
        },
        "success-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(34, 197, 94, 0.7)" },
          "50%": { boxShadow: "0 0 0 8px rgba(34, 197, 94, 0)" },
        },
        flash: {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(0.85)",
          },
        },
      },
    },
  },
  plugins: [],
};
