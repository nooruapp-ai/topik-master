/** @type {import('tailwindcss').Config} */
// 웹앱(src/frontend)의 디자인 토큰을 그대로 이식했습니다.
// 색상·라운드·타이포 스케일을 동일하게 유지해 웹/모바일 일관성을 확보합니다.
module.exports = {
  content: ['./App.tsx', './src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
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
      borderRadius: {
        btn: '14px',
        card: '20px',
        xl3: '24px',
      },
      fontSize: {
        'title-xl': ['28px', { lineHeight: '34px', fontWeight: '700' }],
        'title-l': ['22px', { lineHeight: '29px', fontWeight: '700' }],
        'title-m': ['18px', { lineHeight: '25px', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
};
