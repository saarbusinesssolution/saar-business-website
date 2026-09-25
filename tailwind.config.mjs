/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: 'var(--color-raw-navy)',
          gold: 'var(--color-raw-gold)',
          goldHover: 'var(--color-raw-gold-hover)',
          charcoal: 'var(--color-raw-charcoal)',
          softwhite: 'var(--color-raw-softwhite)',
        },
        surface: {
          page: 'var(--color-bg-page)',
          elevated: 'var(--color-surface-elevated)',
          subtle: 'var(--color-surface-subtle)',
          dark: 'var(--color-surface-dark)',
          goldWash: 'var(--color-accent-gold-wash)',
        },
        border: {
          subtle: 'var(--color-border-subtle)',
          medium: 'var(--color-border-medium)',
          strong: 'var(--color-border-strong)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          navy: 'var(--color-text-navy)',
          muted: 'var(--color-text-muted)',
          inverse: 'var(--color-text-inverse)',
        },
        status: {
          success: 'var(--color-status-success)',
          successBg: 'var(--color-status-success-bg)',
          warning: 'var(--color-status-warning)',
          warningBg: 'var(--color-status-warning-bg)',
          error: 'var(--color-status-error)',
          errorBg: 'var(--color-status-error-bg)',
        },
      },
      fontFamily: {
        serif: 'var(--font-family-serif)',
        sans: 'var(--font-family-sans)',
      },
      maxWidth: {
        content: 'var(--max-content-width)',
        reading: 'var(--reading-max-width)',
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      boxShadow: {
        subtle: 'var(--shadow-subtle)',
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
      },
      zIndex: {
        base: 'var(--z-base)',
        card: 'var(--z-card)',
        sticky: 'var(--z-sticky)',
        drawer: 'var(--z-drawer)',
        modal: 'var(--z-modal)',
        skip: 'var(--z-skip-link)',
      },
    },
  },
  plugins: [],
};
