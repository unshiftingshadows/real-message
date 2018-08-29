import VueAnalytics from 'vue-analytics'

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Vue.use(VueAnalytics, {
    id: 'UA-91729192-4',
    autoTracking: {
      exception: true
    }
  })
}
