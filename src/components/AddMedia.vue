<template>
  <q-modal ref="addMediaModal" v-model="showAddMedia" content-classes="add-media-modal">
    <q-btn
      color="primary"
      @click.native="showAddMedia = false; init();"
      icon="fas fa-times"
      class="float-right"
      size="sm"
    />
    <h4>Add {{ type }}</h4>
    <div class="row gutter-sm">
      <div class="col-12" v-if="type === 'quote'">
        <q-input v-model="quoteText" float-label="Quote Text" type="textarea" :max-height="100" :min-rows="1" />
        <q-input type="text" float-label="Author (optional)" v-model="quoteAuthor" />
        <q-input type="text" float-label="Book Title (optional)" v-model="quoteTitle" />
      </div>
      <div class="col-12" v-if="type === 'illustration'">
        <q-input type="text" float-label="Illustatration Title" v-model="illustrationTitle" />
      </div>
      <div class="col-12" v-if="type === 'lyric'">
        <q-input type="text" float-label="Lyric Title" v-model="lyricTitle" />
      </div>
      <div class="col-12" v-if="type === 'image'">
        <div class="col-12">
          <q-input type="text" float-label="Image URL" v-model="imageURL" />
        </div>
      </div>
      <div class="col-12" v-if="type === 'video'">
        <q-input type="text" float-label="Video URL" v-model="videoURL" />
      </div>
      <div class="col-12">
        <q-btn color="primary" class="float-right" @click.native="add" :disabled="loading">Add {{ type }}</q-btn>
        <q-spinner class="float-right" size="2rem" color="primary" style="margin-right: 20px;" v-if="loading" />
      </div>
    </div>
  </q-modal>
</template>

<script>
import { Notify } from 'quasar'
import FilePond, { registerPlugin } from 'vue-filepond'
import FilePondImagePreview from 'filepond-plugin-image-preview'
import getVideoId from 'get-video-id'
import axios from 'axios'

registerPlugin(FilePondImagePreview)

import 'filepond/dist/filepond.css'
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css'

export default {
  components: {
    FilePond
  },
  props: {
    type: {
      type: String,
      required: true
    },
    refresh: {
      type: Function,
      required: true
    },
    addNew: {
      type: Function
    },
    setLoading: {
      type: Function
    }
  },
  fiery: true,
  name: 'AddMedia',
  data () {
    return {
      loading: false,
      quoteText: '',
      quoteAuthor: '',
      quoteTitle: '',
      illustrationTitle: '',
      lyricTitle: '',
      videoURL: '',
      imageTitle: '',
      imageURL: '',
      showAddMedia: false
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.loading = false
      this.quoteText = ''
      this.quoteAuthor = ''
      this.quoteTitle = ''
      this.illustrationTitle = ''
      this.lyricTitle = ''
      this.videoURL = ''
      this.imageTitle = ''
      this.imageURL = ''
    },
    add: async function () {
      console.log('add')
      if (this.$types.MEDIA.includes(this.type)) {
        var obj = {
          bibleRefs: [],
          tags: [],
          createdDate: new Date(),
          modifiedDate: new Date(),
          user: this.$firebase.auth.currentUser.uid
        }
        switch (this.type) {
          case 'quote':
            if (this.quoteText === '') {
              this.$q.notify('Please review fields again')
              return
            }
            obj.text = this.quoteText
            obj.author = this.quoteAuthor
            obj.title = this.quoteTitle
            break
          case 'image':
            if (this.imageURL === '') {
              this.$q.notify('Please review fields again')
              return
            }
            obj.imageURL = this.imageURL
            obj.service = 'link'
            break
          case 'illustration':
            if (this.illustrationTitle === '') {
              this.$q.notify('Please review fields again')
              return
            }
            obj.title = this.illustrationTitle
            obj.text = ''
            obj.author = ''
            break
          case 'lyric':
            if (this.lyricTitle === '') {
              this.$q.notify('Please review fields again')
              return
            }
            obj.title = this.lyricTitle
            obj.text = ''
            obj.author = ''
            break
          case 'video':
            if (this.videoURL === '') {
              this.$q.notify('Please review fields again')
              return
            }
            obj.pageURL = this.videoURL
            var videoinfo = getVideoId(this.videoURL)
            console.log('videoinfo', videoinfo)
            obj.videoid = videoinfo.id
            obj.service = videoinfo.service
            if (videoinfo.service === 'youtube') {
              var youtubeinfo = await axios.get(`https://noembed.com/embed?url=http://www.youtube.com/watch?v=${videoinfo.id}`)
              console.log('youtube info', youtubeinfo)
              obj.thumbURL = youtubeinfo.data.thumbnail_url
              obj.title = youtubeinfo.data.title
              obj.author = youtubeinfo.data.author_name
              obj.embedURL = 'https://www.youtube.com/embed/' + videoinfo.id
            } else if (videoinfo.service === 'vimeo') {
              var vimeoinfo = await axios.get(`https://vimeo.com/api/v2/video/${videoinfo.id}.json`)
              console.log('vimeo info', vimeoinfo)
              obj.thumbURL = vimeoinfo.data[0].thumbnail_large
              obj.title = vimeoinfo.data[0].title
              obj.author = vimeoinfo.data[0].user_name
              obj.embedURL = 'https://player.vimeo.com/video/' + videoinfo.id
            }
            break
          default:
            console.error('Invalid media type')
            this.$q.notify('Invalid media type')
        }
        console.log(obj)
        this.loading = true
        this.setLoading()
        this.$firebase.list(this.type).add(obj).then((res) => {
          this.refresh(this.type)
          console.log('added', res)
          // GA - Add media event
          this.$ga.event('media', 'add', this.type, res.id)
          this.showAddMedia = false
          this.init()
          Notify.create({
            message: this.type + ' created!',
            type: 'positive',
            position: 'bottom-left'
          })
          this.$sentry.crumb({
            category: 'media',
            message: `Added ${this.type} media: ${res.id}`,
            level: 'info'
          })
          // this.$firebase.log({
          //   category: 'media',
          //   action: 'create',
          //   label: this.type,
          //   curValue: obj,
          //   component: 'AddMedia'
          // })
          if (this.addNew) {
            this.addNew(res.id)
          }
        })
      }
    },
    show () {
      this.showAddMedia = true
    }
  }
}
</script>

<style>
</style>
