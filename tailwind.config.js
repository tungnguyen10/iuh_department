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
      sm: '640px',
      md: '768px',
      lg: '1120px',  // Custom breakpoint cho desktop navigation
      xl: '1280px',
      '2xl': '1536px',
    },
    container: {
      screens: {
        sm: '100%',
        md: '100%',
        lg: '100%',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', '-apple-system', 'sans-serif'],
        inter: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        black: '#616161',
        'primary': {
          white: '#FFFFFF',
          yellow: '#F9B200',
          'dark-blue': '#153898',
        },
        'secondary': {
          green: '#75C7A3',
          yellow: '#FFE293',
          'yellow-light': '#FEF9E3',
          blue: '#8ED8F8',
          'blue-light': '#E3F6FDFF',
        },
        'danger': {
          DEFAULT: '#DD2F2C',
          light: '#FFEBEEFF',
        },
        stroke: "#EEEEEE",
      },
    },
  },
  plugins: [],
}
