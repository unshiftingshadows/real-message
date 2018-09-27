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
          v-if="!$q.platform.is.desktop"
        />
        <q-toolbar-title>
          <img src="statics/logo_message_app@2x.png" style="max-height: 40px;" />
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
        <q-item :to="{ name: 'list', params: { type: 'sermon' }}" class="menu-item" v-if="$root.$children[0].user.app.message.prefs.contentType.sermon">
          <q-item-tile icon="fas fa-comment" />
          <q-item-main label="Sermons" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Sermons</q-tooltip>
        </q-item>
        <q-item :to="{ name: 'list', params: { type: 'lesson' }}" class="menu-item" v-if="$root.$children[0].user.app.message.prefs.contentType.lesson">
          <q-item-tile icon="fas fa-file" />
          <q-item-main label="Lessons" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Lessons</q-tooltip>
        </q-item>
        <q-item :to="{ name: 'list', params: { type: 'scratch' }}" class="menu-item" v-if="$root.$children[0].user.app.message.prefs.contentType.scratch">
          <q-item-tile icon="fas fa-lightbulb" />
          <q-item-main label="Scratch Pads" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Scratch Pad</q-tooltip>
        </q-item>
        <q-item-separator />
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
        <q-item-separator v-if="$root.$children[0].user.nqUser === false" />
        <q-item :to="{ name: 'list', params: { type: 'archive' }}" class="menu-item">
          <q-item-tile icon="fas fa-archive" />
          <q-item-main label="Archive" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Archive</q-tooltip>
        </q-item>
        <q-item to="/settings" class="menu-item">
          <q-item-tile icon="fas fa-cog" />
          <q-item-main label="Settings" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Settings</q-tooltip>
        </q-item>
        <q-item to="/support" class="menu-item">
          <q-item-tile icon="fas fa-question" />
          <q-item-main label="Support" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Support</q-tooltip>
        </q-item>
        <q-item link @click.native="logout" class="menu-item">
          <q-item-tile icon="fas fa-sign-out-alt fab" />
          <q-item-main label="Log Out" class="on-right" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Log Out</q-tooltip>
        </q-item>
      </q-scroll-area>
    </q-layout-drawer>

    <!-- <q-layout-drawer
      side="right"
      v-model="rightDrawer"
      content-class="lg-drawer"
      :breakpoint="1200"
    >
      <q-scroll-area class="fit q-pa-sm">
        <resources v-if="$route.name === 'lesson' || $route.name === 'sermon'" add />
      </q-scroll-area>
    </q-layout-drawer> -->

    <q-page-container>
      <!-- This is where pages get injected -->
      <router-view />
      <!-- <polls /> -->
    </q-page-container>

  </q-layout>
</template>

<script>
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
      leftDrawer: true,
      rightDrawer: false,
      showRightDrawer: this.$route.name === 'lesson' || this.$route.name === 'sermon',
      pageType: this.$route.name
    }
  },
  watch: {
    '$route.name': function (val) {
      console.log('page change')
      this.pageType = val
      this.leftDrawer = true
      this.rightDrawer = false
      this.showRightDrawer = val === 'lesson' || val === 'sermon'
    }
    // TODO: This will need to be edited for NQ users
    // '$root.$children[0].user.nqUser': function (val) {
    //   this.rightDrawer = this.$route.name === 'lesson' && this.$q.platform.is.desktop && val
    // }
  },
  mounted () {
    // console.log('builder $root', this.$root.$children[0].user)
    window.fcWidget.setConfig({
      headerProperty: {
        hideChatButton: false
      }
    })
  },
  methods: {
    logout () {
      console.log('signing out')
      window.fcWidget.user.clear()
      window.fcWidget.destroy()
      this.$firebase.auth.signOut().then(() => {
        this.$router.replace({ path: '/login' })
      })
    },
    checkUser () {
      console.log(this.$root.$children[0].user)
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
