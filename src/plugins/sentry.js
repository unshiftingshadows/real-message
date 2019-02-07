import * as Sentry from '@sentry/browser'

let uEmail = ''
let uName = ''

function setUser (uid, email, username) {
  uEmail = email
  uName = username
  Sentry.configureScope((scope) => {
    scope.setUser({
      email: email,
      id: uid,
      username: username
    })
  })
}

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Sentry.init({
    dsn: 'https://84905595bcfa45f29fc68ec5886b8754@sentry.io/1372280',
    integrations: [new Sentry.Integrations.Vue({ Vue })],
    release: `real-message@${process.env.VER}`,
    environment: process.env.DEV ? 'staging' : 'prod',
    beforeSend (event) {
      console.error('event error', event.exception.values[0].value)
      if (event.exception.values[0].value === 'ResizeObserver loop limit exceeded') {
        console.info('ResizeObserver loop limit exceeded')
        return null
      }
      if (event.exception) {
        Sentry.showReportDialog({
          user: {
            email: uEmail,
            name: uName
          }
        })
      }
      return event
    }
  })
  Vue.prototype.$sentry = {
    setUser,
    err: Sentry.captureException,
    log: Sentry.captureMessage,
    crumb: Sentry.addBreadcrumb
  }
}
