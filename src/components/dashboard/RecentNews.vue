<template>
  <q-card class="dashboard-card">
    <q-card-title>Recent News</q-card-title>
    <q-card-separator />
    <q-card-main style="padding: 0px;">
      <q-list no-border>
        <q-item link v-for="item in items" :key="item.title" @click.native="open(item.link)">
          <q-item-main :label="item.title" :sublabel="cleanLink(item.description)">
            <!-- <q-item-tile>{{ formatDate(item.pubDate) }}</q-item-tile> -->
            <q-item-tile label />
            <q-item-tile sublabel />
          </q-item-main>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>

<script>
import { openURL, date } from 'quasar'

export default {
  name: 'DashboardRecentNews',
  data () {
    return {
      items: []
    }
  },
  mounted () {
    this.load()
  },
  methods: {
    load () {
      this.$axios({
        method: 'get',
        // url: 'https://news.google.com/news/rss/headlines/section/topic/WORLD?ned=us&hl=en&gl=US'
        url: `https://api.rss2json.com/v1/api.json?rss_url=https://news.google.com/rss/search?q=christian&hl=en-US&gl=US&ceid=US:en`
      }).then((res) => {
        console.log('news results', res)
        this.items = res.data.items
      })
    },
    open (url) {
      openURL(url)
    },
    formatDate (val) {
      return date.formatDate(new Date(val), 'YYYY-MM-DD')
    },
    cleanLink (text) {
      return text.split('<p>')[1].replace('</p>', '')
    }
  }
}
</script>

<style>
</style>
