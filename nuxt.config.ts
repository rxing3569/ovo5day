export default defineNuxtConfig({
  compatibilityDate: '2026-07-31',
  devtools: { enabled: true },
  devServer: {
    port: 3005,
  },
  ssr: true,
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      htmlAttrs: { lang: 'zh-Hant' },
      title: '5DAY｜每天都有一點可愛',
      meta: [
        {
          name: 'description',
          content: '5DAY 日系可愛拼貼風品牌頁面，每天替生活貼上一點喜歡。',
        },
        { name: 'theme-color', content: '#e9f2fc' },
      ],
      link: [{ rel: 'icon', type: 'image/x-icon', href: '/5day.ico' }],
    },
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
