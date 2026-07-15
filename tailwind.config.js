/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mint: {
          DEFAULT: '#9FE0C9',
          light: '#CFF1E4',
          dark: '#4FAE8E',
        },
        blush: {
          DEFAULT: '#F6C2CD',
          light: '#FBDFE5',
          dark: '#EE96A8',
        },
        sand: {
          DEFAULT: '#F2E4C9',
          light: '#FAF3E3',
        },
        coral: '#F0A99C',
        ink: '#1F3A34',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
}
