<template>
  <q-card class="dashboard-card">
    <q-card-title>Quote of the Day <small class="text-faded">via WikiQuote</small></q-card-title>
    <q-card-main>
      <p>{{ text }}</p>
      <p class="text-faded text-right">- {{ author }}</p>
    </q-card-main>
  </q-card>
</template>

<script>
const htmlToText = require('html-to-text')
import { date } from 'quasar'

export default {
  name: 'DashboardQOTD',
  data () {
    return {
      text: '',
      author: ''
    }
  },
  mounted () {
    this.$axios({
      method: 'get',
      // url: 'https://commons.wikimedia.org/w/api.php?action=featuredfeed&feed=potd&feedformat=rss&language=en'
      url: `https://en.wikiquote.org/w/api.php?action=parse&origin=*&format=json&page=Wikiquote:Quote_of_the_day/${this.formatDate()}`,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }).then((res) => {
      console.log('quote of the day', res)
      const text = htmlToText.fromString(res.data.parse.text['*'], {
        ignoreHref: true,
        ignoreImage: true
      })
      this.author = text.split('~')[1].trim()
      this.text = text.split('~')[0].trim()
    })
  },
  methods: {
    formatDate () {
      return date.formatDate(Date.now(), 'MMMM_D,_YYYY')
    }
  }
}
</script>

<style>
</style>
