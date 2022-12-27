export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/color-mode',
    '@pinia/nuxt'
  ],
  colorMode: {
    preference: 'system', // default theme
    dataValue: 'theme', // activate data-theme in <html> tag
    classSuffix: '',
  },
  build: {
    transpile: ['@heroicons/vue']
  },
  serverHandlers: [
    { route: '/api/auth', handler: '~/server/api/auth.ts' },
    { route: '/api/auth/**', handler: '~/server/api/auth.ts' },
    { route: '/api/projects', handler: '~/server/api/projects.ts' },
    { route: '/api/projects/**', handler: '~/server/api/projects.ts' },
  ],
})

