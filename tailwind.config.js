// tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f6',
          100: '#e6e9e5',
          200: '#cdd4cb',
          300: '#adb8aa',
          400: '#8b9987',
          500: '#707d6c',
          600: '#5b6657',
          700: '#4a5246',
          800: '#3e443b',
          900: '#353a33',
        },
        earth: {
          50: '#fbf7f4',
          100: '#f3eae2',
          200: '#e7d3c4',
          300: '#d7b49d',
          400: '#c49075',
          500: '#b57656',
          600: '#a66246',
          700: '#8b4e3b',
          800: '#724236',
          900: '#5f3831',
        }
      },
      borderRadius: {
        DEFAULT: '0.625rem',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      boxShadow: {
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.1)',
        'hover': '0 6px 24px -8px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1440px',
        },
      },
    },
  },
  plugins: [],
}