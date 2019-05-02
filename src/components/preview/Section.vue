<template>
  <q-card flat>
    <q-card-title style="margin-bottom: 20px;">
      <div class="q-display-1 text-weight-bold">{{ id === 'hook' ? $root.$children[0].user.app.message.prefs.structureNames.hook : id === 'bible' ? $root.$children[0].user.app.message.prefs.structureNames.bible : data.title }}</div>
      <hr/>
    </q-card-title>
    <q-card-main>
      <div class="row gutter-sm" style="padding-left: 10px; padding-right: 10px;">
        <div class="col-12" v-if="id === 'bible'">
          <preview-bible
            v-for="ref in document.bibleRefs"
            :key="ref"
            class="module-card"
            :mod-options="{ disabled: true }"
            :data="{
              bibleRef: ref
            }"
          />
        </div>
        <div class="col-12" v-if="id !== 'bible'">
          <component
            v-for="modIndex in data.moduleOrder"
            :key="modIndex"
            v-bind:is="$types.CONTENT.includes(modules[modIndex].type) ? 'preview-content' : modules[modIndex].nqmedia ? 'preview-n-q' : 'preview-media'"
            :id="modIndex"
            :data="modules[modIndex]"
            class="module-preview"
          />
        </div>
      </div>
    </q-card-main>
  </q-card>
</template>

<script>
import PreviewContent from 'components/preview/Content.vue'
import PreviewMedia from 'components/preview/Media.vue'
// import PreviewQuote from 'components/preview/Quote.vue'
// import PreviewText from 'components/preview/Text.vue'
import PreviewBible from 'components/preview/Bible.vue'
// import PreviewActivity from 'components/preview/Activity.vue'
// import PreviewQuestion from 'components/preview/Question.vue'
// import PreviewVideo from 'components/preview/Video.vue'
// import PreviewImage from 'components/preview/Image.vue'
// import PreviewComposition from 'components/preview/Composition.vue'
// import PreviewLyric from 'components/preview/Lyric.vue'
// import PreviewIllustration from 'components/preview/Illustration.vue'

export default {
  components: {
    PreviewContent,
    PreviewMedia,
    // PreviewQuote,
    // PreviewText,
    PreviewBible
    // PreviewActivity,
    // PreviewQuestion,
    // PreviewVideo,
    // PreviewImage,
    // PreviewComposition,
    // PreviewLyric,
    // PreviewIllustration
  },
  props: ['id', 'data', 'modules', 'contentType', 'contentid', 'document'],
  name: 'PreviewSection',
  data () {
    return {
    }
  }
}
</script>

<style>
</style>
