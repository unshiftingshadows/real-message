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
        />
        <q-toolbar-title>
          <img src="statics/logo.png" style="max-height: 40px" />
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
      <q-scroll-area class="fit q-pa-sm">
        <q-item to="/real/dashboard">
          <q-item-side icon="fa-home" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">REAL Dashboard</q-tooltip>
        </q-item>
        <q-item-separator />
        <q-item :to="{ name: 'rlist', params: { type: 'series' }}">
          <q-item-side icon="fa-folder" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Series</q-tooltip>
        </q-item>
        <q-item-separator />
        <q-item to="/real/settings">
          <q-item-side icon="fa-cog" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Settings</q-tooltip>
        </q-item>
        <q-item link @click.native="logout">
          <q-item-side icon="fa-sign-out-alt fab" />
          <q-tooltip anchor="center left" self="center right" :disable="$q.platform.is.mobile">Log Out</q-tooltip>
        </q-item>
      </q-scroll-area>
    </q-layout-drawer>

    <q-layout-drawer
      side="right"
      v-model="rightDrawer"
      content-class="bg-grey-9 md-drawer"
      :breakpoint="1200"
    >
      <q-scroll-area class="fit q-pa-sm">
        <component v-bind:is="pageType.slice(1) + '-drawer'" class="drawer" v-if="rightDrawer"></component>
      </q-scroll-area>
    </q-layout-drawer>

    <q-page-container>
      <!-- This is where pages get injected -->
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import SeriesDrawer from 'components/drawers/RSeries.vue'
import LessonDrawer from 'components/drawers/RLesson.vue'
import ResearchDrawer from 'components/drawers/RResearch.vue'
import DevoDrawer from 'components/drawers/RDevo.vue'
import GuideDrawer from 'components/drawers/RGuide.vue'
import ReviewDrawer from 'components/drawers/RReview.vue'

const rightPages = ['rseries', 'rlesson', 'rresearch', 'rdevo', 'rguide', 'rreview']

export default {
  components: {
    SeriesDrawer,
    LessonDrawer,
    ResearchDrawer,
    DevoDrawer,
    GuideDrawer,
    ReviewDrawer
  },
  // name: 'LayoutName',
  data () {
    return {
      leftDrawer: true,
      rightDrawer: rightPages.includes(this.$route.name) && this.$q.platform.is.desktop,
      showRightDrawer: rightPages.includes(this.$route.name),
      pageType: this.$route.name
    }
  },
  watch: {
    '$route.name': function (val) {
      console.log('page change')
      this.pageType = val
      this.leftDrawer = true
      this.rightDrawer = rightPages.includes(this.$route.name) && this.$q.platform.is.desktop
      this.showRightDrawer = rightPages.includes(this.$route.name)
    }
  },
  mounted () {
    window.fcWidget.setConfig({
      headerProperty: {
        hideChatButton: true
      }
    })
  },
  methods: {
    logout () {
      console.log('signing out')
      this.$firebase.auth.signOut().then(() => {
        this.$router.replace('login')
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

.drawer {
  padding: 10px
}

</style>
