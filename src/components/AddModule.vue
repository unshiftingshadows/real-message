<template>
  <div class="col-12 relative-position" style="height: 30px; margin-bottom: 20px;">
    <q-btn round :color="color" icon="fas fa-plus" class="absolute-center" @click.native="showAdd" />
    <add-media :type="type" ref="addMedia" :add-new="addNewMedia" :refresh="init" />
    <!-- TODO: Add a new component here like add-media but that uses the NQ database -->
  </div>
</template>

<script>
import AddMedia from 'components/AddMedia.vue'

export default {
  components: {
    AddMedia
  },
  name: 'AddModule',
  props: [ 'nextModOrder', 'sectionid', 'close', 'edit', 'contentType', 'dark' ],
  data () {
    return {
      moduleTypes: ['activity', 'bible', 'question', 'text', 'mainidea', 'bullet'],
      omediaTypes: ['quote', 'image', 'illustration', 'lyric', 'video'],
      nqmediaTypes: ['book', 'movie', 'video', 'image', 'article', 'composition', 'document', 'discourse', 'note', 'quote', 'illustration', 'outline', 'idea'],
      showAddMedia: false,
      type: '',
      color: 'primary'
    }
  },
  watch: {
    'dark': function (val) {
      if (val === '') {
        this.color = 'dark'
      } else {
        this.color = 'primary'
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      if (this.dark === '') {
        this.color = 'dark'
      } else {
        this.color = 'primary'
      }
    },
    showAdd () {
      var actions = [
        {
          label: 'Text',
          color: 'primary',
          icon: 'fas fa-align-left',
          handler: () => {
            console.log('text!')
            this.addModule('text')
          }
        },
        {
          label: 'Bullet',
          color: 'primary',
          icon: 'fas fa-list',
          handler: () => {
            console.log('bullet!')
            this.addModule('bullet')
          }
        },
        {
          label: 'Bible',
          color: 'primary',
          icon: 'fas fa-book',
          handler: () => {
            console.log('bible!')
            this.addModule('bible')
          }
        },
        {
          label: 'Main Idea',
          color: 'primary',
          icon: 'fas fa-lightbulb',
          handler: () => {
            console.log('mainidea!')
            this.addModule('mainidea')
          }
        },
        {
          label: 'Question',
          color: 'primary',
          icon: 'fas fa-question',
          handler: () => {
            console.log('question!')
            this.addModule('question')
          }
        },
        {
          label: 'Activity',
          color: 'primary',
          icon: 'fas fa-trophy',
          handler: () => {
            console.log('activity!')
            this.addModule('activity')
          }
        }
      ]
      if (!this.$root.$children[0].user.nqUser) {
        actions.push({})
        if (this.$root.$children[0].user.app.message.prefs.mediaType.quote) {
          actions.push({
            label: 'Quote',
            color: 'primary',
            icon: 'fas fa-quote-left',
            handler: () => {
              console.log('quote!')
              this.type = 'quote'
              this.$refs.addMedia.show()
            }
          })
        }
        if (this.$root.$children[0].user.app.message.prefs.mediaType.image) {
          actions.push({
            label: 'Image',
            color: 'primary',
            icon: 'fas fa-image',
            handler: () => {
              console.log('image!')
              this.type = 'image'
              this.$refs.addMedia.show()
            }
          })
        }
        if (this.$root.$children[0].user.app.message.prefs.mediaType.illustration) {
          actions.push({
            label: 'Illustration',
            color: 'primary',
            icon: 'fas fa-paint-brush',
            handler: () => {
              console.log('illustration!')
              this.type = 'illustration'
              this.$refs.addMedia.show()
            }
          })
        }
        if (this.$root.$children[0].user.app.message.prefs.mediaType.lyric) {
          actions.push({
            label: 'Lyric',
            color: 'primary',
            icon: 'fas fa-music',
            handler: () => {
              console.log('lyric!')
              this.type = 'lyric'
              this.$refs.addMedia.show()
            }
          })
        }
        if (this.$root.$children[0].user.app.message.prefs.mediaType.video) {
          actions.push({
            label: 'Video',
            color: 'primary',
            icon: 'fas fa-play',
            handler: () => {
              console.log('video!')
              this.type = 'video'
              this.$refs.addMedia.show()
            }
          })
        }
      }
      this.$q.actionSheet({
        title: 'Add Module',
        grid: false,
        dismissLabel: 'Cancel',
        actions: actions
      }).catch(() => {
        console.log('user dismissed add module action sheet')
      })
    },
    addModule (type, id) {
      // GA - Add module event
      this.$ga.event('module', 'add', type)
      this.close()
      // var newRef = this.$firebase.ref(this.$parent.type, 'modules', this.$parent.id).push()
      if (this.moduleTypes.includes(type) || this.omediaTypes.includes(type) || this.nqmediaTypes.includes(type)) {
        var obj = {
          type: type,
          editing: false,
          slide: false,
          order: this.nextModOrder,
          time: 0,
          wordcount: 0
        }
        if (type === 'text' || type === 'activity') {
          obj.title = ''
          obj.text = ''
        }
        if (type === 'bullet') {
          obj.title = ''
          obj.list = []
          obj.ordered = false
        }
        if (type === 'activity') {
          obj.equipment = []
        }
        if (type === 'question') {
          obj.text = ''
          obj.notes = ''
        }
        if (type === 'bible') {
          obj.text = ''
          obj.bibleRef = ''
          obj.translation = this.$root.$children[0].user.app.prefs.bibleTranslation
        }
        if (this.omediaTypes.includes(type) || this.nqmediaTypes.includes(type)) {
          obj.mediaid = id
          this.edit('')
        } else {
          this.edit(id)
        }
        this.$root.$emit('add-module', obj, this.sectionid)
      } else {
        this.$log.error('Invalid new module type')
      }
    },
    addNewMedia (mediaid) {
      this.showAddMedia = false
      this.addModule(this.type, mediaid)
      this.type = ''
    }
  }
}
</script>

<style>

.add-media-modal {
  padding: 30px;
  width: 100%;
}
@media screen and (min-width: 1200px) {
  .add-media-modal {
    min-width: 500px;
    width: 500px;
  }
}

</style>
