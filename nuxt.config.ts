// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  extends: ['senp-ui'],
  srcDir: './src',
  components: {
    global: true,
    dirs: ['~/components'],
  },
  hooks: {
    'vite:extendConfig': (config, { isClient, isServer }) => {
      if (isClient && config?.resolve?.alias) {
        ;(config.resolve.alias as any).vuedraggable = 'vuedraggable/dist/vuedraggable.common.js'
      }
    },
  },
})
