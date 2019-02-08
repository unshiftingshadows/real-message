<template>
  <q-card class="dashboard-card">
    <q-card-title>Today is:</q-card-title>
    <q-card-main>
      <p><b>Season: </b>{{ capitalize(data.season) }}</p>
      <ul style="list-style-type: none;">
        <li v-for="event in data.celebrations" :key="event.title"><q-chip :color="event.colour === 'white' ? 'light' : event.colour">{{ event.title }}</q-chip></li>
      </ul>
    </q-card-main>
  </q-card>
</template>

<script>
import { format } from 'quasar'
const { capitalize } = format

export default {
  name: 'DashboardChurchCalendar',
  data () {
    return {
      data: {
        season: '',
        celebrations: []
      }
    }
  },
  mounted () {
    this.$axios({
      method: 'get',
      url: `http://calapi.inadiutorium.cz/api/v0/en/calendars/general-en/today`,
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json; charset=utf-8'
      }
    }).then((res) => {
      console.log('church calendar', res)
      this.data = res.data
      // const text = htmlToText.fromString(res.data.parse.text['*'], {
      //   ignoreHref: true,
      //   ignoreImage: true
      // })
      // this.author = text.split('~')[1].trim()
      // this.text = text.split('~')[0].trim()
    })
  },
  methods: {
    capitalize: (val) => capitalize(val)
  }
}
</script>

<style>
</style>
