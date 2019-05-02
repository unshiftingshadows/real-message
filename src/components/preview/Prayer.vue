<template>
  <q-card flat>
    <q-card-title style="margin-bottom: 20px;">
      <div class="q-display-1 text-weight-bold">{{ $root.$children[0].user.app.message.prefs.structureNames.prayer }}</div>
      <span slot="subtitle" v-if="data.title !== ''">{{ data.title }}</span>
      <hr/>
    </q-card-title>
    <q-card-main>
      <p><span v-html="data.text" /></p>
    </q-card-main>
  </q-card>
</template>

<script>
export default {
  name: 'PreviewPrayer',
  props: ['id', 'data'],
  data () {
    return {}
  }
}
</script>

<style>
</style>
