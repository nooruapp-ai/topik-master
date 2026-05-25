/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          light: '#EEF2FF',
          dark: '#4F46E5',
          50: '#EEF2FF',
          100: '#E0E7FF',
        },
        accent: {
          coral: '#FFA8A8',
          mint: '#A8E6CF',
          yellow: '#FFE5A8',
        },
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        ink: {
          DEFAULT: '#1F2937',
          soft: '#6B7280',
          faint: '#9CA3AF',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          soft: '#FAFAFA',
          muted: '#F3F4F6',
        },
        line: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', 'Apple SD Gothic Neo', 'sans-serif'],
      },
      letterSpacing: {
        ko: '-0.02em',
      },
      borderRadius: {
        btn: '14px',
        card: '20px',
        xl3: '24px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03)',
        elevated: '0 4px 12px rgba(0,0,0,0.05)',
        floating: '0 8px 24px rgba(0,0,0,0.08)',
      },
      maxWidth: {
        mobile: '480px',
      },
      fontSize: {
        'title-xl': ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        'title-l': ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        'title-m': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
      },
      transitionTimingFunction: {
        ios: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [],
};
