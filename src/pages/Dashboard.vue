<template>
  <q-page padding>
    <q-alert
      color="primary"
      message="These are some sample Dashboard modules"
      detail="These are planned to be customizable and movable. If you have suggestions for other modules to include, please submit a request =>"
      :actions="[
        { label: 'Submit', handler: () => { openURL('https://www.google.com') } }
      ]"
    />
    <br/>
    <div class="row gutter-lg">
      <div class="col-4">
        <donate />
        <random-media type="quote" />
        <random-media type="video" />
        <qotd />
        <votd />
        <!-- <church-calendar /> -->
      </div>
      <div class="col-4">
        <recent-messages :limit="5" />
        <potd />
        <random-hymn />
      </div>
      <div class="col-4">
        <recent-news />
      </div>
    </div>
  </q-page>
</template>

<script>
import Donate from 'components/dashboard/Donate'
import RecentMessages from 'components/dashboard/RecentMessages'
import RecentMedia from 'components/dashboard/RecentMedia'
import RandomMedia from 'components/dashboard/RandomMedia'
import RecentNews from 'components/dashboard/RecentNews'
import Potd from 'components/dashboard/POTD'
import Qotd from 'components/dashboard/QOTD'
import Votd from 'components/dashboard/VOTD'
import ChurchCalendar from 'components/dashboard/Calendar'
import RandomHymn from 'components/dashboard/RandomHymn'
import { openURL } from 'quasar'

export default {
  components: {
    Donate,
    RecentMessages,
    RecentMedia,
    RandomMedia,
    RecentNews,
    Potd,
    Qotd,
    Votd,
    ChurchCalendar,
    RandomHymn
  },
  name: 'Dashboard',
  methods: {
    openURL: (url) => openURL(url)
  }
}
</script>

<style>

.dashboard-card {
  margin-bottom: 30px;
}

</style>
