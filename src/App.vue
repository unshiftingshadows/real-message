<template>
  <div id="q-app">
    <div id="transparent-layer" v-if="dim"></div>
    <router-view v-if="!showNewUser && !loading" />
    <q-modal v-model="showNewUser" ref="newUserModal" content-classes="new-user-modal" no-route-dismiss no-esc-dismiss no-backdrop-dismiss>
      <div class="row gutter-md">
        <div class="col-12">
          <h4>New User</h4>
          <p>Welcome! Please provide a new password for your account.</p>
        </div>
        <div class="col-12">
          <q-field
            :error="$v.newPassword.$error"
            error-label="Passwords must be at least 8 characters"
          >
            <q-input v-model="newPassword" type="password" float-label="New Password" @blur="$v.newPassword.$touch" @keyup.enter="setPassword" />
          </q-field>
        </div>
        <div class="col-12">
          <q-field
            :error="$v.newPasswordCheck.$error"
            error-label="Passwords must be identical"
          >
            <q-input v-model="newPasswordCheck" type="password" float-label="Retype New Password" @blur="$v.newPasswordCheck.$touch" @keyup.enter="setPassword" />
          </q-field>
        </div>
        <div class="col-12">
          <q-btn color="primary" @click.native="setPassword">Update</q-btn>
        </div>
      </div>
    </q-modal>
  </div>
</template>

<script>
// IMPORTANT!! Used to ensure that quill editors work properly
//             in PWAs
import FastClick from 'fastclick'
FastClick.notNeeded = true

import { required, minLength, sameAs } from 'vuelidate/lib/validators'

var initUser = {
  name: {
    first: '',
    last: ''
  },
  email: '',
  churchid: false,
  churchRoles: {},
  newUser: true,
  nqUser: false,
  app: {
    prefs: {
      theme: 'light'
    },
    lastPage: {
      host: '',
      path: ''
    },
    message: {
      prefs: {
        contentType: {
          series: true,
          scratch: true,
          message: true
        },
        mediaType: {
          illustration: true,
          image: true,
          lyric: false,
          quote: true,
          video: true
        },
        messageStructure: {
          hook: true,
          application: true,
          prayer: true
        },
        preview: {
          clock: true,
          timer: true
        },
        structureNames: {
          application: 'Application',
          hook: 'Hook',
          prayer: 'Prayer'
        },
        speakingSpeed: 120
      },
      stats: {
        nummessage: 0,
        numscratch: 0,
        numarchive: 0,
        numquote: 0,
        numimage: 0,
        numvideo: 0,
        numlyric: 0,
        numillustration: 0
      }
    }
  },
  supportRestore: '',
  realUser: false,
  realRoles: {}
}

export default {
  name: 'App',
  fiery: true,
  data () {
    return {
      loading: true,
      user: initUser,
      dim: false,
      showNewUser: false,
      newPassword: '',
      newPasswordCheck: ''
    }
  },
  validations: {
    newPassword: {
      required,
      minLength: minLength(8)
    },
    newPasswordCheck: {
      sameAsPassword: sameAs('newPassword')
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    'user': function (val) {
      console.log('user changed!', val, this.$firebase.auth.currentUser)
    },
    'user.app.prefs.theme': function (val) {
      if (val === undefined) return
      switch (val) {
        case 'dark':
          document.documentElement.style.setProperty('--background-color', '#333333')
          document.documentElement.style.setProperty('--card-color', '#444444')
          document.documentElement.style.setProperty('--color', '#ffffff')
          document.documentElement.style.setProperty('--drawer-background', '#444444')
          document.documentElement.style.setProperty('--drawer-icons', '#ffffff')
          break
        case 'light':
          document.documentElement.style.setProperty('--background-color', '#ffffff')
          document.documentElement.style.setProperty('--card-color', '#dddddd')
          document.documentElement.style.setProperty('--color', '#333333')
          document.documentElement.style.setProperty('--drawer-background', '#dddddd')
          document.documentElement.style.setProperty('--drawer-icons', '#444444')
          break
        default:
          this.$slog.warn('invalid theme')
          document.documentElement.style.setProperty('--background-color', '#ffffff')
          document.documentElement.style.setProperty('--card-color', '#dddddd')
          document.documentElement.style.setProperty('--color', '#333333')
          document.documentElement.style.setProperty('--drawer-background', '#dddddd')
          document.documentElement.style.setProperty('--drawer-icons', '#444444')
      }
    },
    'user.newUser': function (val) {
      if (val === undefined || val === false) return
      if (val === true) {
        this.showNewUser = true
      }
    },
    '$route': function (val) {
      if (this.$firebase.user()) {
        this.$firebase.user().update({
          'app.message.stats.lastLogin': new Date(),
          'app.lastPage': {
            path: val.path,
            host: 'message'
          }
        })
      }
    }
  },
  methods: {
    init () {
      window.fcWidget.destroy()
      this.newPassword = ''
      this.newPasswordCheck = ''
      this.$firebase.auth.onAuthStateChanged((user) => {
        this.loading = true
        if (!user) {
          this.user.theme = 'light'
          window.fcWidget.init({
            token: '2f1c0fee-afb7-41e3-afd3-132b4330cd55',
            host: 'https://wchat.freshchat.com',
            tags: ['message'],
            siteId: 'message',
            config: {
              disableEvents: true,
              headerProperty: {
                hideChatButton: false
              }
            }
          })
          this.loading = false
        } else {
          this.$log.info('newly logged user', user)
          this.$ga.set('userId', user.uid)
          this.$sentry.setUser(user.uid, user.email, user.displayName)
          this.$sentry.crumb({
            category: 'auth',
            message: `Authenticated user: ${user.email} | ${user.uid}`,
            level: 'info'
          })
          this.user = this.$fiery(this.$firebase.user(), {
            onSuccess: async (userSnap) => {
              if (!this.user.newUser) {
                this.$firebase.setIndex()
              }
              if (this.loading) {
                window.fcWidget.init({
                  token: '2f1c0fee-afb7-41e3-afd3-132b4330cd55',
                  host: 'https://wchat.freshchat.com',
                  tags: ['message'],
                  siteId: 'message',
                  externalId: userSnap.uid,
                  restoreId: userSnap.supportRestore.message,
                  firstName: userSnap.name.first,
                  lastName: userSnap.name.last,
                  email: userSnap.email,
                  phone: userSnap.phone,
                  config: {
                    disableEvents: true,
                    headerProperty: {
                      direction: 'ltr',
                      hideChatButton: true
                    }
                  }
                })
                document.getElementById('fc_frame').style.display = 'none'
                window.fcWidget.on('user:created', (resp) => {
                  this.$log.info('freshchat - user created', resp)
                  if (resp.status === 200) {
                    this.$firebase.user().update({
                      'supportRestore.message': resp.data.restoreId
                    })
                  }
                })
                window.fcWidget.on('widget:closed', () => {
                  document.getElementById('fc_frame').style.display = 'none'
                })
                if (this.user.nqUser) {
                  if (await this.$firebase.nqLogin(this.user.nqUser.uid)) {
                    this.$log.info('nq user authenticated', this.$firebase.nqAuth.currentUser)
                  } else {
                    this.$log.warn('nq user error...')
                  }
                }
                this.loading = false
              }
            }
          })
        }
      })
    },
    setPassword () {
      this.$v.newPassword.$touch()
      this.$v.newPasswordCheck.$touch()
      if (this.$v.newPassword.$error || this.$v.newPasswordCheck.$error) {
        this.$q.notify.create('Please review password fields')
      }
      this.$firebase.auth.currentUser.updatePassword(this.newPassword).then(() => {
        this.$firebase.user().update({
          'app.message.stats.firstLogin': new Date(),
          newUser: false
        })
        this.$q.notify({
          type: 'positive',
          message: 'New password set!',
          position: 'bottom-left'
        })
        this.showNewUser = false
        this.newPassword = ''
        this.newPasswordCheck = ''
      }).catch((error) => {
        this.$log.error('set password error', error)
        this.$q.notify(error.message)
      })
    }
  }
}
</script>

<style>

/* .q-layout-page {
  color: #ffffff;
  background-color: #333333;
}

.modal-content {
  color: #ffffff;
  background-color: #333333;
}

.q-popover {
  color: #ffffff;
  background-color: #333333;
} */

/* Style content and background */
.q-layout-page, .modal-content, .q-popover {
  color: var(--color);
  background-color: var(--background-color);
}

/* Style text input */
.q-input-area, .q-input-target {
  color: var(--color);
}

/* Always white text */
.bg-primary .q-input-area, .bg-primary .q-input-target {
  color: #ffffff;
}

/* Style all cards */
.q-card {
  color: var(--color);
  background-color: var(--card-color);
}

.q-card-title {
  font-size: 20px !important;
  font-weight: 500 !important;
}

.q-card-subtitle {
  color: var(--color);
}

.q-card-main {
  font-size: 16px !important;
  line-height: 22px !important;
  font-weight: 400 !important;
}

/* Style drawer background color */
.sm-drawer, .md-drawer, .lg-drawer {
  background-color: var(--drawer-background);
  color: var(--color);
}

/* Style drawer icon color */
.sm-drawer i, .md-drawer i, .lg-drawer i {
  color: var(--drawer-icons);
}

/* Set up drawer widths */
.sm-drawer {
  width: 75px;
}

.md-drawer {
  width: 100%;
}

.lg-drawer {
  width: 100%;
}

@media screen and (min-width: 1200px) {
  .md-drawer {
    width: 25%;
  }
  .lg-drawer {
    width: 35%;
  }
}

#transparent-layer {
  position: fixed;
  width: 100%;
  height: 100%;
  background-color: black;
  opacity: 0.5;
  z-index: 1;
}

.active-card {
  z-index: 2;
  position: relative;
}

.new-user-modal {
  padding: 30px;
  width: 100%;
}

@media screen and (min-width: 1200px) {
  .new-user-modal {
    min-width: 500px;
    width: 500px;
  }
}

.q-popover {
  max-width: 100%;
}
@media screen and (min-width: 768px) {
  .q-popover {
    max-width: 400px;
  }
}
@media screen and (min-width: 1200px) {
  .q-popover {
    max-width: 800px;
  }
}

</style>
