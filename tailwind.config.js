/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        sans: ["PlusJakartaSans_400Regular", "system-ui"],
        arabic: ["Amiri_400Regular", "serif"],
        thuluth: ["ArefRuqaa_400Regular", "serif"],
        mono: ["FiraCode_400Regular", "monospace"],
      },
      boxShadow: {
        'emerald': '0 4px 30px rgba(16, 185, 129, 0.05)',
        'amber': '0 4px 30px rgba(245, 158, 11, 0.05)',
      },
      animation: {
        'floating-gold': 'floatText 4s ease-in-out infinite',
      },
      keyframes: {
        floatText: {
          '0%, 100%': { transform: 'translateY(0px) scale(1)' },
          '50%': { transform: 'translateY(-5px) scale(1.02)' },
        }
      }
    },
  },
  plugins: [],
}
