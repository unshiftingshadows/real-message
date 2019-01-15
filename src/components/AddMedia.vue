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
        <q-btn-toggle
          v-model="imageType"
          toggle-color="primary"
          :options="imageOptions"
        />
        <br/>
        <br/>
        <div class="col-12" v-if="imageType === 'wiki'">
          <q-input type="text" float-label="Wiki Title" v-model="imageTitle" />
        </div>
        <div class="col-12" v-if="imageType === 'upload'">
          <FilePond
            name="image-upload"
            ref="image-upload"
            labelIdle="Drop files here..."
            allowMultiple="false"
            acceptedFileTypes="image/jpeg, image/png"
            :files="images"
            :server="imageServer"
          />
        </div>
        <div class="col-12" v-if="imageType === 'link'">
          <q-input type="text" float-label="Image URL" v-model="imageURL" />
        </div>
      </div>
      <div class="col-12" v-if="type === 'video'">
        <q-input type="text" float-label="Video URL" v-model="videoURL" />
      </div>
      <div class="col-12" v-if="!(type === 'image' && imageType === 'upload')">
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
      imageType: '',
      imageTitle: '',
      images: [],
      imageURL: '',
      imageOptions: [
        // {
        //   label: 'Wiki',
        //   value: 'wiki'
        // },
        {
          label: 'Upload',
          value: 'upload'
        },
        {
          label: 'Link',
          value: 'link'
        }
      ],
      imageServer: {
        process: (fieldName, file, metadata, load, error, progress, abort) => {
          // Should do custom file upload or local storing here
          this.loading = true
          this.$firebase.list(this.type).add({ service: 'upload', user: this.$firebase.auth.currentUser.uid }).then((res) => {
          // this.$database.add('image', { service: 'upload' }, (res) => {
            // GA - Add image media event
            this.$ga.event('media', 'add', 'image-upload')
            var uploadProcess = this.$firebase.imagesRef.child(res.id).put(file)
            uploadProcess.on('state_changed', (snapshot) => {
              progress(true, snapshot.bytesTransferred, snapshot.totalBytes)
            }, (err) => {
              error(err)
            }, () => {
              load(uploadProcess.snapshot.ref.name)
              uploadProcess.snapshot.ref.getDownloadURL().then((url) => {
                this.refresh(this.type)
                this.showAddMedia = false
                this.init()
              })
            })
          })

          // Can call the error method if something is wrong, should exit after
          // error('oh my goodness');

          // Should call the progress method to update the progress to 100% before calling load
          // (endlessMode, processedSize, totalSize)
          // progress(true, 0, 1024);

          // Should call the load method when done and pass the returned server file id
          // the unique server file id is used by revert and restore functions
          // load('unique-file-id');

          // Should expose an abort method so the request can be cancelled
          return {
            abort: () => {
              // User tapped abort, cancel our ongoing actions here

              // Let FilePond know the request has been cancelled
              abort()
            }
          }
        },
        revert: './revert',
        restore: './restore/',
        load: './load/',
        fetch: './fetch/'
      },
      types: ['quote', 'image', 'illustration', 'lyric', 'video'],
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
      this.illustrationTitle = ''
      this.lyricTitle = ''
      this.videoURL = ''
      this.imageType = ''
      this.imageTitle = ''
      this.images = []
      this.imageURL = ''
    },
    add: async function () {
      console.log('add')
      if (this.types.includes(this.type)) {
        var obj = {
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
            switch (this.imageType) {
              case 'wiki':
                if (this.imageTitle === '') {
                  this.$q.notify('Please review fields again')
                  return
                }
                obj.title = this.imageTitle
                obj.service = 'wiki'
                break
              case 'upload':
                return
              case 'link':
                if (this.imageURL === '') {
                  this.$q.notify('Please review fields again')
                  return
                }
                obj.imageURL = this.imageURL
                obj.service = 'link'
                break
              default:
                console.error('invalid image type')
            }
            break
          case 'illustration':
            if (this.illustrationTitle === '') {
              this.$q.notify('Please review fields again')
              return
            }
            obj.title = this.illustrationTitle
            break
          case 'lyric':
            if (this.lyricTitle === '') {
              this.$q.notify('Please review fields again')
              return
            }
            obj.title = this.lyricTitle
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
        // this.$database.add(this.type, obj, (res) => {
        //   // GA - Add media event
        //   this.$ga.event('media', 'add', this.type)
        //   this.showAddMedia = false
        //   this.loading = false
        //   this.addNew(res)
        //   Notify.create({
        //     message: this.type + ' created!',
        //     type: 'positive',
        //     position: 'bottom-left'
        //   })
        // })
        this.$firebase.list(this.type).add(obj).then((res) => {
          this.refresh(this.type)
          console.log('added', res)
          // GA - Add media event
          this.$ga.event('media', 'add', this.type)
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
