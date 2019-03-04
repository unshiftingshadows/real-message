<template>
  <q-card color="secondary">
    <q-card-title>
      <span class="float-right" style="font-size: .8rem; vertical-align: top; line-height: 1rem;">{{ time }} minutes&nbsp;&nbsp;&nbsp;</span>
      <q-icon name="fas fa-book" size="2rem" />&nbsp;&nbsp;&nbsp;
      {{ readableRef }} <span class="q-caption">{{ translation }}</span>
    </q-card-title>
    <q-card-main>
      <p>{{ text }}</p>
    </q-card-main>
  </q-card>
</template>

<script>
export default {
  name: 'preview-bible',
  props: [ 'data' ],
  data () {
    return {
      loading: true,
      translation: this.$root.$children[0].user.app.prefs.bibleTranslation,
      readableRef: this.$bible.readable(this.data.bibleRef),
      text: ''
    }
  },
  computed: {
    time () {
      return Math.ceil(this.text.split(' ').length / this.$root.$children[0].user.app.message.prefs.speakingSpeed)
    }
  },
  created () {
    this.$bible.text(this.data.bibleRef, this.$root.$children[0].user.app.prefs.bibleTranslation).then(res => {
      this.text = res
    })
  },
  methods: {
  }
}
</script>

<style>
</style>
