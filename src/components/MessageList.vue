<template>
  <div>
    <h4>Messages</h4>
    <div v-if="!loading && Object.keys(items).length > 0">
      <q-card inline v-for="message in messageOrder" :key="message" class="content-card" @click.native="openItem(message)">
        <q-card-title>{{ items[message].title }}</q-card-title>
        <q-card-main>
          <p>{{ items[message].mainIdea }}</p>
          <span v-if="items[message].tags.length > 0">Tags: <q-chip v-for="tag in items[message].tags" :key="tag" color="primary" class="list-chip" dense>{{ tag }}</q-chip></span>
          <br v-if="items[message].tags.length > 0 && Object.keys(items[message].bibleRefs).length > 0" />
          <span v-if="Object.keys(items[message].bibleRefs).length > 0">Bible Refs: <q-chip v-for="ref in items[message].bibleRefs" :key="ref" color="secondary" class="list-chip" dense>{{ $bible.readable(ref) }}</q-chip></span>
        </q-card-main>
      </q-card>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageList',
  props: [ 'seriesid', 'messageOrder' ],
  fiery: true,
  data () {
    return {
      loading: true,
      items: []
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      const startTime = new Date()
      this.loading = true
      this.items = this.$fiery(this.$firebase.list('message'), {
        query: (items) => items.where('users', 'array-contains', this.$firebase.auth.currentUser.uid).where('seriesid', '==', this.seriesid).where('archived', '==', false),
        map: true,
        key: '_id',
        exclude: ['_id'],
        onSuccess: () => {
          const timeElapsed = new Date() - startTime
          this.$ga.time({
            timingCategory: 'query',
            timingVar: 'content',
            timingValue: timeElapsed,
            timingLabel: 'series-messages'
          })
          console.log('loaded items')
          this.loading = false
        }
      })
    },
    openItem (id) {
      this.$router.push({ name: 'message', params: { id: id } })
    }
  }
}
</script>

<style>

.content-card {
  margin: 10px;
  width: 95%;
  cursor: pointer;
  opacity: 0.6;
  -webkit-transition-duration: .5s;
  transition-duration: .5s;
}

.content-card:hover {
  opacity: 1;
}

.list-chip {
  margin-top: 5px;
  margin-bottom: 5px;
  margin-right: 2px;
}

@media screen and (min-width: 800px) {
  .content-card {
    width: 47%;
  }
}
@media screen and (min-width: 1200px) {
  .content-card {
    width: 31%;
  }
}

</style>
