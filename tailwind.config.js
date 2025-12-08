// /project/tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*. {js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Compañeros, colores principales del logo Synapsis
        'synapsis': {
          'dark': '#2F4858',      // Azul petróleo oscuro (principal)
          'blue': '#345B63',      // Azul petróleo
          'orange': '#F4A261',    // Naranja/dorado (secundario)
          'gold': '#E9B872',      // Dorado claro
          'cyan': '#48C9B0',      // Turquesa/cyan (acento)
          'teal': '#5DADE2',      // Azul claro
        },
        // Compañeros, colores modernos para el diseño
        'modern': {
          'lime': '#A3E635',      // Verde lima (éxito)
          'pink': '#EC4899',      // Magenta/rosa (destacados)
          'yellow': '#FCD34D',    // Amarillo (warnings)
          'purple': '#A855F7',    // Púrpura (opcional)
        },
        // Compañeros, escala de grises
        'neutral': {
          '50': '#F9FAFB',
          '100': '#F3F4F6',
          '200': '#E5E7EB',
          '800': '#1F2937',
          '900': '#111827',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0. 06)',
        'card-hover': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'glow-orange': '0 0 20px rgba(244, 162, 97, 0.4)',
        'glow-cyan': '0 0 20px rgba(72, 201, 176, 0.4)',
      },
    },
  },
  plugins: [],
};