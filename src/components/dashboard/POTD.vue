<template>
  <q-card class="dashboard-card">
    <q-card-title>Picture of the Day <small class="text-faded">via WikiMedia Commons</small></q-card-title>
    <q-card-media>
      <img :src="url" />
    </q-card-media>
    <q-card-main>
      <b>{{ title.replace('File:', '').split('.')[0] }}</b>
      <p class="text-faded">{{ description }}</p>
    </q-card-main>
  </q-card>
</template>

<script>
const htmlToText = require('html-to-text')
import { date } from 'quasar'

export default {
  name: 'DashboardPOTD',
  data () {
    return {
      url: '',
      title: '',
      description: ''
    }
  },
  mounted () {
    this.$axios({
      method: 'get',
      // url: 'https://commons.wikimedia.org/w/api.php?action=featuredfeed&feed=potd&feedformat=rss&language=en'
      url: `https://commons.wikimedia.org/w/api.php?action=query&origin=*&format=json&prop=images&titles=Template:Potd/${this.formatDate()}_(en)`,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }).then((res) => {
      console.log('picture of the day', res)
      const imageFile = res.data.query.pages[Object.keys(res.data.query.pages)[0]].images[0].title
      console.log('file name', imageFile)
      this.$axios({
        method: 'get',
        url: 'https://commons.wikimedia.org/w/api.php?action=query&origin=*&format=json&prop=imageinfo&titles=' + imageFile + '&iiprop=extmetadata%7Curl',
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        }
      }).then((finalRes) => {
        console.log('final', finalRes)
        const info = finalRes.data.query.pages[Object.keys(finalRes.data.query.pages)[0]]
        console.log('info', info)
        this.url = info.imageinfo[0].url
        this.title = info.title
        this.description = htmlToText.fromString(info.imageinfo[0].extmetadata.ImageDescription.value, {
          ignoreHref: true,
          ignoreImage: true
        })
      })
    })
  },
  methods: {
    formatDate () {
      return date.formatDate(Date.now(), 'YYYY-MM-DD')
    }
  }
}
</script>

<style>
</style>
