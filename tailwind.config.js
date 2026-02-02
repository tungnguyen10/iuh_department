/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.html",
    "./src/components/**/*.{html,js}",
    "./src/js/**/*.js",
    // Nếu dùng root: 'src/pages', cần thêm path tương đối
    "./**/*.html",
    "../components/**/*.{html,js}",
    "../js/**/*.js",
  ],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1120px", // Custom breakpoint cho desktop navigation
      "2xl": "1280px",
      "3xl": "1536px",
    },
    container: {
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["Roboto", "system-ui", "-apple-system", "sans-serif"],
        inter: ["Inter", "system-ui", "-apple-system", "sans-serif"],
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
        // Avatar colors for leadership component
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
    },
  },
  plugins: [],
};
