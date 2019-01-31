<template>
  <q-page padding>
    <h3>{{ capitalizeTitle(type) }}s <q-btn size="sm" icon="fas fa-plus" color="primary" @click.native="$refs.addMedia.show()" /></h3>
    <div v-if="loading">
      <q-spinner color="primary" class="absolute-center" size="3rem" />
    </div>
    <div v-if="!loading && mediaTypes.includes(type)">
      <div v-masonry transition-duration="0.3s" item-selectior=".media-item">
        <q-card inline v-masonry-tile v-for="item in items" :key="item.id" class="media-card media-item" @click.native="openItem(item.id, item)">
          <q-card-media v-if="type === 'image' || type === 'video'">
            <img v-if="item.thumbURL" :src="item.thumbURL" />
            <img v-else :src="item.imageURL" />
            <q-card-title slot="overlay" v-if="type === 'video'">{{ item.title }}</q-card-title>
          </q-card-media>
          <q-card-title v-if="type === 'lyric' || type === 'illustration'">{{ item.title }}</q-card-title>
          <q-card-main v-if="type !== 'image' && type !== 'video'">
            <p>{{ item.text }}</p>
          </q-card-main>
        </q-card>
      </div>
    </div>
    <add-media :type="type" ref="addMedia" v-if="mediaTypes.includes(type)" :refresh="init" />
    <q-modal ref="showMediaModal" v-model="showMedia" content-classes="add-media-modal" v-if="mediaTypes.includes(type)">
      <component v-bind:is="'media-' + type" :data="openMedia" :open="showMedia" :close="closeMedia" @hide="closeMedia" v-if="showMedia" />
    </q-modal>
  </q-page>
</template>

<script>
import AddMedia from 'components/AddMedia.vue'
import MediaQuote from 'components/media/Quote.vue'
import MediaImage from 'components/media/Image.vue'
import MediaIllustration from 'components/media/Illustration.vue'
import MediaLyric from 'components/media/Lyric.vue'
import MediaVideo from 'components/media/Video.vue'
import { format } from 'quasar'
const { capitalize } = format

export default {
  components: {
    AddMedia,
    MediaQuote,
    MediaImage,
    MediaIllustration,
    MediaLyric,
    MediaVideo
  },
  name: 'ListMedia',
  fiery: true,
  data () {
    return {
      mediaTypes: ['quote', 'image', 'illustration', 'lyric', 'video'],
      type: this.$route.params.type,
      items: [],
      loading: false,
      showAddMedia: false,
      showMedia: false,
      openMedia: {}
    }
  },
  mounted () {
    this.init(this.type)
  },
  watch: {
    '$route.params.type' (newType, oldType) {
      this.type = newType
      this.$fiery.free(this.items)
      this.init(newType)
    }
  },
  methods: {
    init (type) {
      this.$ga.event('media', 'list', this.$route.params.type)
      const startTime = new Date()
      this.loading = true
      this.items = this.$fiery(this.$firebase.list(type), {
        // once: true,
        query: (list) => list.where('user', '==', this.$firebase.auth.currentUser.uid).orderBy('dateAdded', 'desc'),
        key: 'id',
        exclude: ['id'],
        onSuccess: (list) => {
          const timeElapsed = new Date() - startTime
          this.$ga.time({
            timingCategory: 'media',
            timingVar: 'query',
            timingValue: timeElapsed,
            timingLabel: type
          })
          if (type === 'image') {
            list.forEach((image) => {
              if (image.service === 'upload') {
                this.$firebase.imagesRef.child(image.id).getDownloadURL().then((url) => {
                  image.thumbURL = url
                  image.imageURL = url
                  image.pageURL = url
                })
              }
            })
          }
          this.loading = false
        }
      })
    },
    openItem (id, item) {
      console.log(id)
      console.log(this.type)
      if (this.mediaTypes.includes(this.type)) {
        console.log('open media')
        this.openMedia = item
        this.showMedia = true
      }
    },
    closeMedia () {
      console.log('close media')
      this.showMedia = false
      this.openMedia = {}
    },
    capitalizeTitle (title) {
      return capitalize(title)
    }
  }
}
</script>

<style>

.media-card {
  margin: 10px;
  width: 95%;
  cursor: pointer;
  opacity: 0.6;
  -webkit-transition-duration: .5s;
  transition-duration: .5s;
}

.media-card:hover {
  opacity: 1;
}

.add-media-modal {
  padding: 30px;
  width: 100%;
}

@media screen and (min-width: 800px) {
  .media-card {
    width: 47%;
  }
}
@media screen and (min-width: 1200px) {
  .media-card {
    width: 31%;
  }
  .add-media-modal {
    min-width: 500px;
    width: 500px;
  }
}

</style>
