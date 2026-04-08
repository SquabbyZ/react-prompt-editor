/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docs/**/*.{md,mdx,ts,tsx}',
  ],
  theme: {
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'expand-in': 'expand-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'collapse-out': 'collapse-out 0.2s cubic-bezier(0.65, 0, 0.35, 1)',
        'slide-down-children': 'slide-down-children 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(-8px)', opacity: '0' },
        },
        'expand-in': {
          from: { transform: 'scaleY(0.95)', opacity: '0' },
          to: { transform: 'scaleY(1)', opacity: '1' },
        },
        'collapse-out': {
          from: { transform: 'scaleY(1)', opacity: '1' },
          to: { transform: 'scaleY(0.95)', opacity: '0' },
        },
        'slide-down-children': {
          from: { maxHeight: '0', opacity: '0', transform: 'translateY(-4px)' },
          to: { maxHeight: '2000px', opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
  corePlugins: {
    preflight: false,
  },
};
