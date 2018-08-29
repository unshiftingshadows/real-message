<template>
  <q-page padding>
    <div class="col-xs-12 col-md-8">
      <h2>{{ archive.title }}</h2>
    </div>
    <div class="col-xs-12 col-md-8">
      <h3>Main Idea</h3>
      <h6>{{ archive.mainIdea }}</h6>
    </div>
    <div class="col-xs-12 col-md-8">
      <content-preview :id="id" type="oarchive" />
    </div>
  </q-page>
</template>

<script>
import ContentPreview from 'components/ContentPreview.vue'

export default {
  components: {
    ContentPreview
  },
  // name: 'PageName',
  data () {
    return {
      id: this.$route.params.id,
      archive: {}
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.$database.view('oarchive', this.id, (data) => {
        this.archive = data
        this.readableRefs = data.bibleRefs.map(e => { return this.$bible.readable(e) })
      })
    }
  }
}
</script>

<style>
</style>
