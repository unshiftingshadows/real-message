<template>
  <q-layout view="hHr LpR lFf"> <!-- Be sure to play with the Layout demo on docs -->
    <!-- (Optional) The Header -->
    <q-layout-header reveal>
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="menu"
          @click="leftDrawer = !leftDrawer"
          v-if="!$q.platform.is.desktop"
        />
        <q-toolbar-title>
          <img src="statics/logo.png" style="max-height: 40px; display: block; margin-left: auto; margin-right: auto;" />
        </q-toolbar-title>
        <q-btn
          flat
          round
          dense
          icon="menu"
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
    >
      <!-- QScrollArea is optional -->
      <q-scroll-area class="fit q-pa-sm" v-if="$root.user.prefs">
        <q-item to="/dashboard" class="menu-item">
          <q-item-tile icon="fa-home" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Dashboard</q-tooltip>
        </q-item>
        <q-item to="/real/dashboard" v-if="$root.user.realUser" class="menu-item">
          <q-item-tile image><img src="statics/logo_square@0.5x.png" style="width: 30px;" /></q-item-tile>
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">REAL Curriculum</q-tooltip>
        </q-item>
        <q-item-separator />
        <q-item :to="{ name: 'olist', params: { type: 'sermon' }}" class="menu-item" v-if="$root.user.prefs.contentType.sermon">
          <q-item-tile icon="fa-comment" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Sermons</q-tooltip>
        </q-item>
        <q-item :to="{ name: 'olist', params: { type: 'lesson' }}" class="menu-item" v-if="$root.user.prefs.contentType.lesson">
          <q-item-tile icon="fa-file" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Lessons</q-tooltip>
        </q-item>
        <q-item :to="{ name: 'olist', params: { type: 'scratch' }}" class="menu-item" v-if="$root.user.prefs.contentType.scratch">
          <q-item-tile icon="fa-lightbulb" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Scratch Pad</q-tooltip>
        </q-item>
        <q-item-separator />
        <div v-if="$root.user.nqUser === false">
          <q-item :to="{ name: 'omedia', params: { type: 'quote' }}" class="menu-item" v-if="$root.user.prefs.mediaType.quote">
            <q-item-tile icon="fa-quote-left" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Quotes</q-tooltip>
          </q-item>
          <q-item :to="{ name: 'omedia', params: { type: 'image' }}" class="menu-item" v-if="$root.user.prefs.mediaType.image">
            <q-item-tile icon="fa-image" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Images</q-tooltip>
          </q-item>
          <q-item :to="{ name: 'omedia', params: { type: 'illustration' }}" class="menu-item" v-if="$root.user.prefs.mediaType.illustration">
            <q-item-tile icon="fa-paint-brush" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Illustrations</q-tooltip>
          </q-item>
          <q-item :to="{ name: 'omedia', params: { type: 'lyric' }}" class="menu-item" v-if="$root.user.prefs.mediaType.lyric">
            <q-item-tile icon="fa-music" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Lyrics</q-tooltip>
          </q-item>
          <q-item :to="{ name: 'omedia', params: { type: 'video' }}" class="menu-item" v-if="$root.user.prefs.mediaType.video">
            <q-item-tile icon="fa-play" />
            <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Videos</q-tooltip>
          </q-item>
        </div>
        <q-item-separator v-if="$root.user.nqUser === false" />
        <q-item :to="{ name: 'olist', params: { type: 'archive' }}" class="menu-item" v-if="$root.user.prefs.contentType.scratch">
          <q-item-tile icon="fa-archive" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Archive</q-tooltip>
        </q-item>
        <q-item to="/settings" class="menu-item">
          <q-item-tile icon="fa-cog" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Settings</q-tooltip>
        </q-item>
        <q-item to="/support" class="menu-item">
          <q-item-tile icon="fa-question" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Support</q-tooltip>
        </q-item>
        <q-item link @click.native="logout" class="menu-item">
          <q-item-tile icon="fa-sign-out-alt fab" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Log Out</q-tooltip>
        </q-item>
      </q-scroll-area>
    </q-layout-drawer>

    <q-layout-drawer
      side="right"
      v-model="rightDrawer"
      content-class="lg-drawer"
      :breakpoint="1200"
    >
      <q-scroll-area class="fit q-pa-sm">
        <resources v-if="$route.name === 'olesson' || $route.name === 'osermon'" add />
      </q-scroll-area>
    </q-layout-drawer>

    <q-page-container>
      <!-- This is where pages get injected -->
      <router-view />
      <polls />
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
  // name: 'LayoutName',
  data () {
    return {
      leftDrawer: true,
      rightDrawer: false,
      showRightDrawer: this.$route.name === 'olesson' || this.$route.name === 'osermon',
      pageType: this.$route.name
    }
  },
  watch: {
    '$route.name': function (val) {
      console.log('page change')
      this.pageType = val
      this.leftDrawer = true
      this.rightDrawer = false
      this.showRightDrawer = val === 'olesson' || val === 'osermon'
    }
    // '$root.user.nqUser': function (val) {
    //   this.rightDrawer = this.$route.name === 'olesson' && this.$q.platform.is.desktop && val
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
      console.log('signing out')
      window.fcWidget.user.clear()
      window.fcWidget.destroy()
      this.$firebase.auth.signOut().then(() => {
        this.$router.replace({ path: '/login' })
      })
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

</style>
