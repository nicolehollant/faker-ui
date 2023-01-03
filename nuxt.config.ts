// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['senp-ui'],
  srcDir: './src',
  components: {
    global: true,
    dirs: ['~/components'],
  },
})
