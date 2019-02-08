<template>
  <q-card class="dashboard-card" color="primary">
    <q-card-title style="background-color: var(--q-color-tertiary);" class="text-center"><span class="q-headline text-weight-bold">Donate to REAL Church</span></q-card-title>
    <q-card-separator />
    <q-card-main>
      <p>REAL Church relies on generous donations from its users and supporters to keep this software free for all. Please consider donating to REAL Church today to keep this software free for all!</p>
      <q-btn color="secondary" size="xl" label="Give" class="full-width" @click.native="openDonate()" />
    </q-card-main>
  </q-card>
</template>

<script>
export default {
  name: 'DashboardDonate',
  data () {
    return {}
  },
  methods: {
    openDonate () {
      document.getElementById('donate-link').click()
    }
  }
}
</script>

<style>
</style>
