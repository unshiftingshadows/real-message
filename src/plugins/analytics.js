import VueAnalytics from 'vue-analytics'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Vue.use(VueAnalytics, {
    id: 'UA-125091051-1',
    // router,
    debug: {
      sendHitTask: !process.env.DEV
    },
    autoTracking: {
      exception: true,
      exceptionLogs: !process.env.DEV
    }
  })
}
