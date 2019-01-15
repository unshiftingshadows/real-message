<template>
  <div>
    <!-- <resource-search /> -->
    <!-- <q-search v-model="searchTerm" placeholder="Search..." color="dark" inverted icon="fas fa-search" @keyup.enter="search()">
      <q-spinner size="2rem" color="secondary" class="float-right" v-if="searching" />
    </q-search>
    <n-q-list :items="resources" :add-module="addModule" singlecolumn v-if="resources.length > 0 && !searching" /> -->
    <q-search v-model="searchTerm" placeholder="Search..." color="dark" inverted icon="fas fa-search">
      <q-autocomplete
        @search="search"
        @selected="selectedMedia"
        ref="searchModal"
        :max-results="5"
      />
    </q-search>
  </div>
</template>

<script>
import NQList from 'components/NQList'

export default {
  components: {
    NQList
  },
  name: 'DrawerMessage',
  fiery: true,
  data () {
    return {
      // messageLoading: true,
      // message: this.$fiery(this.$firebase.ref('message', '', this.$route.params.id), {
      //   onSuccess: (message) => {
      //     this.messageLoading = false
      //   }
      // }),
      resources: [],
      searchTerm: '',
      searching: false
    }
  },
  watch: {
    'topicSelect': async function (newVal, oldVal) {
      if (newVal !== 'none' && newVal !== oldVal && newVal !== this.topic.id) {
        this.topicLoading = true
        this.topic = (await this.$firebase.nqTopics([newVal])).data.joined[0]
        this.topicLoading = false
      }
    }
  },
  mounted () {
  },
  methods: {
    addModule (id, type) {
      var obj = {
        media: id,
        type: type,
        editing: false,
        slide: false,
        time: 0,
        wordcount: 0,
        nqmedia: true
      }
      this.$root.$emit('add-module', obj)
    },
    async search (input, done) {
      console.log('auth?', this.$firebase.nqAuth.currentUser)
      // this.searching = true
      const acceptableTypes = [ 'quote', 'outline', 'idea', 'illustration', 'video', 'image', 'composition', 'article', 'document' ]
      this.$firebase.nqSearch(input, (results) => {
        done(results.filter(e => { return acceptableTypes.includes(e.item.type) }))
      })
      // console.log('search term', this.searchTerm)
      // this.resources = (await this.$firebase.nqSearch(this.searchTerm, acceptableTypes)).results
      // this.searching = false
    },
    selectedMedia (item) {
      console.log('selected', item)
      this.addModule(item.id, item.item.type)
    }
  }
}
</script>

<style>
</style>
