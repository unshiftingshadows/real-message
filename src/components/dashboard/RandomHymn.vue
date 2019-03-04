<template>
  <q-card class="dashboard-card">
    <q-card-title>Random Hymn</q-card-title>
    <q-card-main>
      <p class="text-faded float-right">{{ hymn.refs }}</p>
      <p><b>{{ hymn.title }}</b></p>
      <span style="white-space: pre-wrap;">{{ hymn.text }}</span>
    </q-card-main>
  </q-card>
</template>

<script>
export default {
  name: 'DashboardRandomHymn',
  data () {
    return {
      hymn: {
        title: '',
        refs: '',
        text: ''
      }
    }
  },
  mounted () {
    this.pullHymn()
  },
  methods: {
    pullHymn () {
      const translation = this.$bible.bcv.translation_info('esv')
      const randomBook = translation.books[Math.floor(Math.random() * 65)]
      const randomChapter = Math.floor(Math.random() * translation.chapters[randomBook].length) + 1
      this.$axios({
        method: 'get',
        url: `https://hymnary.org/api/scripture?reference=${randomBook}+${randomChapter}`
      }).then((res) => {
        if (res.data.length === 0) {
          this.pullHymn()
        } else {
          const hymn = res.data[Object.keys(res.data)[0]]
          this.hymn.title = hymn.title
          // this.hymn.refs = hymn['scripture references']
          this.hymn.refs = randomBook + ' ' + randomChapter
          const textLink = hymn['text link'].split('/').pop()
          this.$axios({
            method: 'get',
            url: `https://hymnary.org/api/fulltext/${textLink}`
          }).then((text) => {
            if (text.data.length === 0) {
              this.pullHymn()
            } else {
              this.hymn.text = text.data[0].text
            }
          })
        }
      })
    }
  }
}
</script>

<style>
</style>
