<template>
  <q-card flat>
    <q-card-title style="margin-bottom: 20px;">
      <div class="q-display-1 text-weight-bold">{{ $root.$children[0].user.app.message.prefs.structureNames.application }}</div>
      <span slot="subtitle" v-if="data.title !== ''">{{ data.title }}</span>
      <hr/>
    </q-card-title>
    <q-card-main>
      <div v-if="data.thought !== ''">
        <div class="q-headline text-weight-light">Thought</div>
        <p>{{ data.thought }}</p>
      </div>
      <div v-if="data.today !== ''">
        <div class="q-headline text-weight-light">Today</div>
        <p>{{ data.today }}</p>
      </div>
      <div v-if="data.thisweek !== ''">
        <div class="q-headline text-weight-light">This Week</div>
        <p>{{ data.thisweek }}</p>
      </div>
    </q-card-main>
  </q-card>
</template>

<script>
export default {
  name: 'PreviewApplication',
  props: ['id', 'data'],
  data () {
    return {}
  }
}
</script>

<style>
</style>
