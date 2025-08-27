module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es'],
    localeDetection: false,
  },
  fallbackLng: {
    default: ['en'],
  },
  debug: process.env.NODE_ENV === 'development',
  reloadOnPrerender: process.env.NODE_ENV === 'development',
  
  // Namespace configuration
  ns: ['common'],
  defaultNS: 'common',
  
  // Interpolation configuration
  interpolation: {
    escapeValue: false,
  },
  
  // React configuration
  react: {
    useSuspense: false,
  },
};