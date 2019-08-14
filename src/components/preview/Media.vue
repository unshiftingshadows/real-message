<template>
  <div v-if="!loading">
    <!-- <q-card color="primary" v-if="data.type === 'quote'">
      <q-card-title>{{ media.text }}</q-card-title>
      <q-card-main>
        <div class="q-body-2" style="text-align: right;">{{ media.title }}<span v-if="media.title !== '' && media.author !== ''"> | </span>{{ media.author }}</div>
      </q-card-main>
    </q-card> -->
    <blockquote v-if="data.type === 'quote'">
      <span style="white-space: pre-wrap"><em>{{ media.text }}</em></span>
      <small v-if="media.title !== '' || media.author !== ''">{{ media.author }}<span v-if="media.title !== '' && media.author !== ''"> | </span><cite :title="media.title">{{ media.title }}</cite></small>
    </blockquote>
    <div class="quote" v-if="data.type === 'illustration' || data.type ==='lyric'">
      <span style="white-space: pre-wrap"><em>{{ media.text }}</em></span>
      <br/>
      <br/>
      <small v-if="media.title !== '' || media.author !== ''">{{ media.author }}<span v-if="media.title !== '' && media.author !== ''"> | </span><cite :title="media.title">{{ media.title }}</cite></small>
    </div>
    <img v-if="data.type === 'image'" :src="media.imageURL" style="width: 70%;" />
    <q-video v-if="data.type === 'video'" :src="getEmbedURL()" />
  </div>
</template>

<script>
export default {
  name: 'preview-media',
  props: ['id', 'data'],
  fiery: true,
  data () {
    return {
      loading: true,
      media: {
        text: '',
        title: '',
        author: ''
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.media = this.$fiery(this.$firebase.list(this.data.type).doc(this.data.mediaid), {
        key: 'id',
        exclude: ['id'],
        onSuccess: () => {
          this.loading = false
        }
      })
    },
    getEmbedURL () {
      if (this.data.type === 'video') {
        if (this.media.service === 'youtube') {
          return 'https://www.youtube.com/embed/' + this.media.videoid
        } else if (this.media.service === 'vimeo') {
          return 'https://player.vimeo.com/video/' + this.media.videoid
        }
      }
    }
  }
}
</script>

<style>
</style>
