<template>
  <div v-if="$root.$children[0].user && $root.$children[0].user.app && $root.$children[0].user.app.message">
    <!-- <q-btn color="primary" label="Refresh" @click.native="init" /> -->
    <div v-if="$root.$children[0].user.nqUser">
      <!-- <add-research :currentResearch="research" :id="id" :type="type" :reinit="init" v-if="add === ''" />
      <n-q-list :items="resources" :addModule="addModule" /> -->
      <drawer-message />
    </div>
    <div v-if="!$root.$children[0].user.nqUser">
      <media-search :addModule="addModule" v-if="!$root.$children[0].user.nqUser" />
    </div>
  </div>
</template>

<script>
import MediaSearch from 'components/MediaSearch.vue'
// import NQList from 'components/NQList.vue'
// import AddResearch from 'components/AddResearch.vue'
import DrawerMessage from 'components/DrawerMessage.vue'

var mediaTypes = ['quote', 'image', 'illustration', 'lyric', 'video']

export default {
  components: {
    MediaSearch,
    // NQList,
    // AddResearch
    DrawerMessage
  },
  // name: 'ComponentName',
  props: ['add'],
  data () {
    return {
      type: this.$route.name,
      id: this.$route.params.id,
      resources: [],
      research: []
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    '$route.name': function (val) {
      this.type = val
      this.init()
    }
  },
  methods: {
    init () {
      // Check if NQ user to determine what resources to get ---
      //    NQ user --> get from $database.resources
      //    Non-NQ user --> get from $database.list?
      this.resources = []
      if (!this.$root.$children[0].user.nqUser) {
      } else {
      }
    },
    resType (type) {
      var items = []
      this.resources.forEach(item => {
        if (item.type === type) {
          items.push(item.media)
        }
      })
      return items
    },
    addModule (id, type) {
      if (mediaTypes.includes(type)) {
        // var newRef = this.$firebase.ref(this.type, 'modules', this.id).push()
        var obj = {
          mediaid: id,
          editing: false,
          slide: false,
          time: 0,
          wordcount: 0,
          type: type,
          nqmedia: false
        }
        // newRef.set(obj)
        this.$root.$emit('add-module', obj)
      } else {
        this.$log.warn('Incorrect media type for module add')
      }
    }
  }
}
</script>

<style>
</style>
