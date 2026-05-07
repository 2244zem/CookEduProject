/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Palet warna hangat sesuai brief: terracotta, cream, charcoal, sage
      colors: {
        terracotta: {
          50: '#fdf5f3',
          100: '#fbe8e3',
          200: '#f8d5cb',
          300: '#f2b8a6',
          400: '#e99073',
          500: '#C4634F',   // Primary — warna utama
          600: '#ae4f3c',
          700: '#923f31',
          800: '#79362c',
          900: '#653029',
        },
        cream: {
          50: '#FEFDFB',
          100: '#FAF5F0',   // Background utama
          200: '#F5EDE3',
          300: '#EDE0D1',
          400: '#E0CCBA',
          500: '#D4B89D',
        },
        charcoal: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#cccccc',
          300: '#999999',
          400: '#666666',
          500: '#4A4A4A',
          600: '#3D3D3D',
          700: '#2D2D2D',   // Text utama
          800: '#1F1F1F',
          900: '#141414',
        },
        sage: {
          50: '#f4f6f3',
          100: '#e5eae2',
          200: '#cbd6c5',
          300: '#a7b99e',
          400: '#8B9E82',   // Accent
          500: '#6b8160',
          600: '#546850',
          700: '#435340',
          800: '#384435',
          900: '#2e382d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      // Animasi custom
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
