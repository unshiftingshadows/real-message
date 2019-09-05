<template>
  <div class="clock">
    <q-card v-if="!$root.$children[0].user.app.message.prefs.preview || $root.$children[0].user.app.message.prefs.preview.clock || $root.$children[0].user.app.message.prefs.preview.timer">
      <q-card-main>
        <q-chip color="primary" class="on-left" v-if="!$root.$children[0].user.app.message.prefs.preview || $root.$children[0].user.app.message.prefs.preview.clock">{{ currentTime }}</q-chip>
        <span v-if="!$root.$children[0].user.app.message.prefs.preview || $root.$children[0].user.app.message.prefs.preview.timer">
          {{ timerMinutes }}:{{ timerSeconds }} | {{ time }}:00
          <q-btn
            :color="timerStart ? 'negative' : 'primary'"
            size="sm"
            class="on-right"
            @click.native="timerStart ? timerStart = false : timerStart = Date.now()"
          >
            {{ timerStart ? 'Stop' : 'Start' }}
          </q-btn>
        </span>
      </q-card-main>
    </q-card>
  </div>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'Clock',
  props: ['time'],
  data () {
    return {
      currentTime: date.formatDate(Date.now(), 'h:mm A'),
      timerSeconds: '00',
      timerMinutes: '00',
      timerStart: false
    }
  },
  mounted () {
    this.currentTime = date.formatDate(Date.now(), 'h:mm A')
    setInterval(() => this.updateCurrentTime(), 1000)
  },
  methods: {
    updateCurrentTime () {
      this.currentTime = date.formatDate(Date.now(), 'h:mm A')
      if (this.timerStart) {
        var diff = date.getDateDiff(Date.now(), this.timerStart, 'seconds')
        this.timerSeconds = this.pad(diff % 60)
        this.timerMinutes = this.pad(Math.floor(diff / 60))
      }
    },
    pad (num, size) {
      var s = String(num)
      while (s.length < (size || 2)) {
        s = '0' + s
      }
      return s
    }
  }
}
</script>

<style>

.clock {
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1000;
}

</style>
