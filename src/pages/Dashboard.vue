<template>
  <q-page padding>
    <div class="row gutter-lg">
      <div class="col-4">
        <!-- <recent-media /> -->
        <random-media type="quote" />
        <random-media type="video" />
        <qotd />
      </div>
      <div class="col-4">
        <recent-messages :limit="5" />
        <potd />
      </div>
      <div class="col-4">
        <recent-news />
      </div>
    </div>
  </q-page>
</template>

<script>
import RecentMessages from 'components/dashboard/RecentMessages'
import RecentMedia from 'components/dashboard/RecentMedia'
import RandomMedia from 'components/dashboard/RandomMedia'
import RecentNews from 'components/dashboard/RecentNews'
import Potd from 'components/dashboard/POTD'
import Qotd from 'components/dashboard/QOTD'

export default {
  components: {
    RecentMessages,
    RecentMedia,
    RandomMedia,
    RecentNews,
    Potd,
    Qotd
  },
  name: 'Dashboard'
}
</script>

<style>

.dashboard-card {
  margin-bottom: 30px;
}

</style>
