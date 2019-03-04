<template>
  <q-card class="dashboard-card">
    <q-card-title>Verse of the Day <small class="text-faded">via Our Manna</small></q-card-title>
    <q-card-main>
      <p>{{ text }}</p>
      <p class="text-faded text-right">{{ ref }} ({{ version }})</p>
    </q-card-main>
  </q-card>
</template>

<script>
export default {
  name: 'DashboardVOTD',
  data () {
    return {
      text: '',
      ref: '',
      version: ''
    }
  },
  mounted () {
    this.$axios({
      method: 'get',
      url: `https://beta.ourmanna.com/api/v1/get/?format=json`
    }).then((res) => {
      this.ref = res.data.verse.details.reference
      this.text = res.data.verse.details.text
      this.version = res.data.verse.details.version
    })
  }
}
</script>

<style>
</style>
