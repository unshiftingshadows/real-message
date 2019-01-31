<template>
  <div>
    <!-- <q-card v-if="data.type === 'text'">
      <q-card-title>{{ data.title }}</q-card-title>
      <q-card-main>
        <span v-html="data.text"/>
      </q-card-main>
    </q-card> -->
    <div v-if="data.type === 'text'">
      <h6 class="text-weight-light">{{ data.title }}</h6>
      <span v-html="data.text" />
    </div>
    <!-- <q-card color="secondary" v-if="data.type === 'bible'">
      <q-card-title>
        <q-icon name="fas fa-book" size="2rem" />&nbsp;&nbsp;&nbsp;
        {{ data.bibleRef }} <span class="q-caption">{{ data.translation.toUpperCase() }}</span>
      </q-card-title>
      <q-card-main>
        <p>{{ data.text }}</p>
      </q-card-main>
    </q-card> -->
    <blockquote v-if="data.type === 'bible'" style="border-color: var(--q-color-secondary);">
      <p><em>{{ data.text }}</em></p>
      <small>{{ data.bibleRef }} | <cite :title="data.translation">{{ data.translation.toUpperCase() }}</cite></small>
    </blockquote>
  </div>
</template>

<script>
export default {
  name: 'preview-content',
  props: ['id', 'data'],
  data () {
    return {}
  }
}
</script>

<style>
</style>
