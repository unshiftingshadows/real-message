<template>
  <div>
    <div v-if="data.type !== 'bible'">
      <div class="q-headline text-weight-light" style="margin-bottom: 10px;">
        <span v-if="data.type !== 'bible' && data.type !== 'question'">{{ data.title }}</span>
        <span v-if="data.type === 'question'">{{ data.question }}</span>
      </div>
      <span v-if="data.type !== 'bullet'" v-html="data.text" />
      <span class="q-title" v-if="data.type === 'bullet'">
        <component v-bind:is="data.ordered ? 'ol' : 'ul'">
          <li v-for="item in data.list" :key="item" style="margin-bottom: 10px;">
            {{ item }}
          </li>
        </component>
      </span>
    </div>
    <blockquote v-if="data.type === 'bible'" style="border-color: var(--q-color-secondary);">
      <p><em>{{ data.text }}</em></p>
      <small>{{ data.bibleRef }} | <cite :title="data.translation">{{ data.translation.toUpperCase() }}</cite></small>
    </blockquote>
    <blockquote v-if="data.notes || data.type === 'activity'" class="q-caption"><span v-html="data.type === 'activity' ? 'Equipment: ' + data.equipment.join(', ') : data.notes" /></blockquote>
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
