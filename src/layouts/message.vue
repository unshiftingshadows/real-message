<template>
  <q-layout view="hHr LpR lFf"> <!-- Be sure to play with the Layout demo on docs -->
    <!-- (Optional) The Header -->
    <q-layout-header reveal>
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="fas fa-bars"
          @click="leftDrawer = !leftDrawer"
          v-if="$q.platform.is.mobile && !$q.platform.is.ipad"
        />
        <q-toolbar-title>
          <img src="https://real-45953.firebaseapp.com/logos/logo_message_app%402x.png" style="max-height: 40px;" />
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="fas fa-bars"
          @click="rightDrawer = !rightDrawer"
          v-if="showRightDrawer"
        />
      </q-toolbar>
    </q-layout-header>

    <!-- (Optional) The Footer -->
    <!-- <q-layout-footer>
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="menu"
          @click="leftDrawer = !leftDrawer"
        />
        <q-toolbar-title>
          Footer
          <span slot="subtitle">Subtile</span>
        </q-toolbar-title>
      </q-toolbar>
    </q-layout-footer> -->

    <!-- (Optional) A Drawer; you can add one more with side="right" or change this one's side -->
    <q-layout-drawer
      side="left"
      v-model="leftDrawer"
      content-class="sm-drawer"
      mini
    >
      <!-- QScrollArea is optional -->
      <q-scroll-area class="fit q-pa-sm" v-if="$root.$children[0].user && $root.$children[0].user.app && $root.$children[0].user.app.message.prefs">
        <q-item to="/dashboard" class="menu-item">
          <q-item-tile icon="fas fa-home" />
          <q-item-main label="Dashboard" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Dashboard</q-tooltip>
        </q-item>
        <q-item-separator />
        <q-item :to="{ name: 'list', params: { type: 'series' }}" class="menu-item">
          <q-item-tile icon="fas fa-folder" />
          <q-item-main label="Series" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Series</q-tooltip>
        </q-item>
        <q-item :to="{ name: 'list', params: { type: 'message' }}" class="menu-item">
          <q-item-tile icon="fas fa-file" />
          <q-item-main label="Messages" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Messages</q-tooltip>
        </q-item>
        <q-item :to="{ name: 'list', params: { type: 'scratch' }}" class="menu-item" v-if="$root.$children[0].user.app.message.prefs.contentType.scratch">
          <q-item-tile icon="fas fa-lightbulb" />
          <q-item-main label="Scratch Pads" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Scratch Pad</q-tooltip>
        </q-item>
        <q-item-separator />
        <div v-if="$root.$children[0].user.nqUser !== false">
          <q-item link @click.native="openLink('https://app.notesandquotes.app')" class="menu-item">
            <q-item-tile icon="fas fa-quote-left" />
            <q-item-main label="Notes and Quotes" class="on-right" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Notes and Quotes</q-tooltip>
          </q-item>
        </div>
        <div v-if="$root.$children[0].user.nqUser === false">
          <q-item :to="{ name: 'media', params: { type: 'quote' }}" class="menu-item" v-if="$root.$children[0].user.app.message.prefs.mediaType.quote">
            <q-item-tile icon="fas fa-quote-left" />
            <q-item-main label="Quotes" class="on-right" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Quotes</q-tooltip>
          </q-item>
          <q-item :to="{ name: 'media', params: { type: 'image' }}" class="menu-item" v-if="$root.$children[0].user.app.message.prefs.mediaType.image">
            <q-item-tile icon="fas fa-image" />
            <q-item-main label="Images" class="on-right" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Images</q-tooltip>
          </q-item>
          <q-item :to="{ name: 'media', params: { type: 'illustration' }}" class="menu-item" v-if="$root.$children[0].user.app.message.prefs.mediaType.illustration">
            <q-item-tile icon="fas fa-paint-brush" />
            <q-item-main label="Illustrations" class="on-right" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Illustrations</q-tooltip>
          </q-item>
          <q-item :to="{ name: 'media', params: { type: 'lyric' }}" class="menu-item" v-if="$root.$children[0].user.app.message.prefs.mediaType.lyric">
            <q-item-tile icon="fas fa-music" />
            <q-item-main label="Lyrics" class="on-right" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Lyrics</q-tooltip>
          </q-item>
          <q-item :to="{ name: 'media', params: { type: 'video' }}" class="menu-item" v-if="$root.$children[0].user.app.message.prefs.mediaType.video">
            <q-item-tile icon="fas fa-play" />
            <q-item-main label="Videos" class="on-right" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Videos</q-tooltip>
          </q-item>
        </div>
        <q-item-separator />
        <q-item to="/settings" class="menu-item">
          <q-item-tile icon="fas fa-cog" />
          <q-item-main label="Settings" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Settings</q-tooltip>
        </q-item>
        <q-item class="menu-item" link @click.native="openChat">
          <q-item-tile icon="fas fa-comments" />
          <q-item-main label="Chat" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Chat</q-tooltip>
        </q-item>
        <q-item class="menu-item" link @click.native="supportEmail">
        <!-- <q-item to="/support" class="menu-item"> -->
          <q-item-tile icon="fas fa-question" />
          <q-item-main label="Support" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Support</q-tooltip>
        </q-item>
        <q-item link @click.native="logout" class="menu-item">
          <q-item-tile icon="fas fa-sign-out-alt fab" />
          <q-item-main label="Log Out" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Log Out</q-tooltip>
        </q-item>
        <div class="fixed-bottom" v-if="!$q.platform.is.mobile">
          <q-item link class="menu-item" @click.native="openDonate()">
            <q-item-tile icon="fas fa-donate fab" />
            <q-item-main label="Donate" class="on-right" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Donate</q-tooltip>
          </q-item>
          <q-item link class="menu-item">
            <q-item-tile>
              <img src="https://real-45953.firebaseapp.com/icons/icon_church%402x.png" width="50px" />
            </q-item-tile>
            <q-popover anchor="bottom right" self="bottom left" :fit="$q.platform.is.mobile && !$q.platform.is.ipad" :cover="$q.platform.is.mobile && !$q.platform.is.ipad">
              <q-list link>
                <q-item v-close-overlay @click.native="openLink('https://realchurch.app')">
                  <q-item-tile>
                    <img src="https://real-45953.firebaseapp.com/icons/icon_church%402x.png" width="50px" />
                  </q-item-tile>
                  <q-item-main label="REAL Church" class="on-right" />
                </q-item>
                <q-item v-close-overlay @click.native="openLink('https://curriculum.realchurch.app')">
                  <q-item-tile>
                    <img src="https://real-45953.firebaseapp.com/icons/icon_curriculum%402x.png" width="50px" />
                  </q-item-tile>
                  <q-item-main label="REAL Curriculum" class="on-right" />
                </q-item>
                <q-item v-close-overlay @click.native="openLink('https://database.realchurch.app')">
                  <q-item-tile>
                    <img src="https://real-45953.firebaseapp.com/icons/icon_database%402x.png" width="50px" />
                  </q-item-tile>
                  <q-item-main label="REAL Database" class="on-right" />
                </q-item>
              </q-list>
            </q-popover>
          </q-item>
        </div>
        <div class="fixed-bottom" v-if="$q.platform.is.mobile" style="padding: 30px;">
          <q-btn label="Give" icon="fas fa-donate" class="float-left" color="primary" />
          <q-btn round class="float-right">
            <img src="https://real-45953.firebaseapp.com/icons/icon_church%402x.png" width="42px" />
            <q-popover anchor="bottom right" self="bottom left" :fit="$q.platform.is.mobile && !$q.platform.is.ipad" :cover="$q.platform.is.mobile && !$q.platform.is.ipad">
              <q-list link>
                <q-item v-close-overlay @click.native="openLink('https://realchurch.app')">
                  <q-item-tile>
                    <img src="https://real-45953.firebaseapp.com/icons/icon_church%402x.png" width="50px" />
                  </q-item-tile>
                  <q-item-main label="REAL Church" class="on-right" />
                </q-item>
                <q-item v-close-overlay @click.native="openLink('https://curriculum.realchurch.app')">
                  <q-item-tile>
                    <img src="https://real-45953.firebaseapp.com/icons/icon_curriculum%402x.png" width="50px" />
                  </q-item-tile>
                  <q-item-main label="REAL Curriculum" class="on-right" />
                </q-item>
                <q-item v-close-overlay @click.native="openLink('https://database.realchurch.app')">
                  <q-item-tile>
                    <img src="https://real-45953.firebaseapp.com/icons/icon_database%402x.png" width="50px" />
                  </q-item-tile>
                  <q-item-main label="REAL Database" class="on-right" />
                </q-item>
              </q-list>
            </q-popover>
          </q-btn>
        </div>
      </q-scroll-area>
    </q-layout-drawer>

    <q-layout-drawer
      side="right"
      v-model="rightDrawer"
      content-class="lg-drawer"
      :breakpoint="1200"
      v-if="$route.name === 'message'"
    >
      <q-scroll-area class="fit q-pa-sm">
        <resources add />
        <!-- <drawer-message /> -->
      </q-scroll-area>
    </q-layout-drawer>

    <q-page-container>
      <!-- This is where pages get injected -->
      <router-view />
      <!-- <polls /> -->
    </q-page-container>

  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import Resources from 'components/Resources.vue'
import Polls from 'components/Polls.vue'

export default {
  components: {
    Resources,
    Polls
  },
  name: 'LayoutMessage',
  data () {
    return {
      leftDrawer: !this.$q.platform.is.mobile || this.$q.platform.is.ipad,
      rightDrawer: false,
      showRightDrawer: this.$route.name === 'message',
      pageType: this.$route.name
    }
  },
  watch: {
    '$route.name': function (val) {
      console.log('page change')
      this.pageType = val
      this.leftDrawer = !this.$q.platform.is.mobile || this.$q.platform.is.ipad
      this.rightDrawer = false
      this.showRightDrawer = val === 'message'
    }
    // TODO: This will need to be edited for NQ users
    // '$root.$children[0].user.nqUser': function (val) {
    //   this.rightDrawer = this.$route.name === 'lesson' && this.$q.platform.is.desktop && val
    // }
  },
  mounted () {
    window.fcWidget.setConfig({
      headerProperty: {
        hideChatButton: false
      }
    })
  },
  methods: {
    logout () {
      this.$log.info('signing out', this.$firebase.auth.currentUser.uid)
      window.fcWidget.user.clear()
      window.fcWidget.destroy()
      this.$firebase.nqAuth.signOut()
      this.$firebase.auth.signOut().then(() => {
        this.$router.replace({ path: '/login' })
      })
    },
    openChat () {
      if (window.fcWidget.isOpen()) {
        window.fcWidget.close()
      } else {
        document.getElementById('fc_frame').style.display = 'block'
        window.fcWidget.open()
      }
    },
    openLink (link) {
      openURL(link)
    },
    openDonate () {
      document.getElementById('donate-link').click()
    },
    supportEmail () {
      if (this.$q.platform.is.cordova || this.$q.platform.is.electron) {
        openURL(`mailto:support@realchurch.app?subject=REAL Message Support | ${this.$route.name}&body=Route: ${this.$route.path}%0AParams: ${JSON.stringify(this.$route.params)}%0AQuery: ${JSON.stringify(this.$route.query)}%0A%0A`)
      } else {
        window.open(`mailto:support@realchurch.app?subject=REAL Message Support | ${this.$route.name}&body=Route: ${this.$route.path}%0AParams: ${JSON.stringify(this.$route.params)}%0AQuery: ${JSON.stringify(this.$route.query)}%0A%0A`, '_self')
      }
    }
  }
}
</script>

<style lang="stylus">

@import "~variables"

.menu-item:hover, .router-link-active {
  background: inherit !important
}

.menu-item:hover > i, .router-link-active > i {
  color: $primary !important
}

.drawer {
  padding: 10px
}

</style>
