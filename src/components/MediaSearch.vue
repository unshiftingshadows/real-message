<template>
  <q-modal ref="modal" v-model="showing">
    <div class="search-modal">
      <div class="row gutter-sm">
        <div class="col-12">
          <q-input v-model="searchTerms" @keyup.enter="search" ref="searchInput" />
        </div>
        <div class="col-12">
          <q-select
            :value="selectedTypes"
            @change="val => { selectedTypes = val }"
            multiple
            :options="types"
          />
        </div>
        <div class="col-12" v-if="loading">
          <q-spinner color="primary" class="absolute-center" size="3rem" />
        </div>
        <div class="col-12" v-if="!loading">
          <div v-masonry transition-duration="0.3" item-selection=".media-cardl">
            <q-card v-for="item in showItems" :key="item.id" color="primary" inline v-bind:class="[item.type] + 'l'" class="media-cardl" @click.native="openItem(item, item.type)">
              <!-- <q-icon name="fas fa-plus" color="positive" class="float-right cursor-pointer" style="margin-top: 5px; margin-right: 5px;" /> -->
              <q-card-media v-if="item.type == 'video'">
                <img :src="item.thumbURL" />
              </q-card-media>
              <q-card-media v-if="item.type == 'image'">
                <img :src="item.imageURL" />
              </q-card-media>
              <q-card-title v-if="item.type == 'video' || item.type === 'lyric'">
                {{ item.title }}
              </q-card-title>
              <q-card-main v-if="item.type === 'quote' || item.type === 'illustration'">
                <p v-if="item.type === 'illustration'"><b>{{ item.title }}</b></p>
                <p>{{ item.text }}</p>
                <p class="q-body-2 float-right" v-if="item.type === 'quote' && (item.author !== '' || item.title !== '')">{{ item.author }}<span v-if="item.author !== '' && item.title !== ''"> - </span>{{ item.title }}</p>
                <p class="q-body-2 float-right" v-if="item.type === 'illustration'">{{ item.author }}</p>
              </q-card-main>
            </q-card>
          </div>
        </div>
      </div>
    </div>
    <q-modal v-model="mediaOpen" content-classes="media-modal" v-if="types.map(e => { return e.value }).includes(media.type)">
      <component v-if="types.map(e => { return e.value }).includes(media.type)" v-bind:is="'media-' + media.type" :data="media" :addModule="addModule" :open="mediaOpen" :close="closeMedia" />
    </q-modal>
  </q-modal>
</template>

<script>
import { format } from 'quasar'
import MediaQuote from 'components/media/Quote.vue'
import MediaImage from 'components/media/Image.vue'
import MediaIllustration from 'components/media/Illustration.vue'
import MediaLyric from 'components/media/Lyric.vue'
import MediaVideo from 'components/media/Video.vue'

const { capitalize } = format
var mediaTypes = ['quote', 'image', 'illustration', 'lyric', 'video']

export default {
  components: {
    MediaQuote,
    MediaImage,
    MediaIllustration,
    MediaLyric,
    MediaVideo
  },
  name: 'MediaSearch',
  props: ['sectionid'],
  data () {
    return {
      showing: false,
      loading: false,
      searchTerms: '',
      items: [],
      showItems: [],
      mediaOpen: false,
      mediaType: '',
      media: '',
      // cardStyle: {
      //   width: this.width
      // },
      selectedTypes: Object.keys(this.$root.$children[0].user.app.message.prefs.mediaType)
      // types: [
      //   // {
      //   //   label: 'All',
      //   //   value: 'all'
      //   // },
      //   {
      //     label: 'Image',
      //     value: 'image'
      //   },
      //   {
      //     label: 'Video',
      //     value: 'video'
      //   },
      //   {
      //     label: 'Quote',
      //     value: 'quote'
      //   },
      //   {
      //     label: 'Illustration',
      //     value: 'illustration'
      //   },
      //   {
      //     label: 'Lyric',
      //     value: 'lyric'
      //   }
      // ]
    }
  },
  watch: {
    'selectedTypes': function () {
      this.showItems = this.items.filter(this.checkType)
    },
    'items': function (value) {
      this.showItems = value
    }
  },
  computed: {
    types: function () {
      var typesList = []
      if (this.$root.$children[0].user.app.message.prefs) {
        for (let key in this.$root.$children[0].user.app.message.prefs.mediaType) {
          if (this.$root.$children[0].user.app.message.prefs.mediaType[key]) {
            typesList.push({
              label: capitalize(key),
              value: key
            })
          }
        }
      }
      return typesList
    }
  },
  methods: {
    addModule (id, type) {
      if (mediaTypes.includes(type)) {
        // var newRef = this.$firebase.ref(this.type, 'modules', this.id).push()
        var obj = {
          mediaid: id,
          editing: false,
          slide: false,
          time: 0,
          wordcount: 0,
          type: type,
          nqmedia: false
        }
        // newRef.set(obj)
        this.$root.$emit('add-module', obj, this.sectionid)
      } else {
        this.$log.warn('Incorrect media type for module add')
      }
      this.showing = false
    },
    openItem (item, type) {
      if (this.types.map(function (e) { return e.value }).includes(type)) {
        this.mediaOpen = true
        this.media = item
        this.mediaType = type
      } else {
        this.$log.warn('Incorrect item type for routing...', { item, type })
      }
    },
    closeMedia () {
      this.mediaOpen = false
      this.media = {}
    },
    checkType (item) {
      return this.selectedTypes.includes(item.type)
    },
    search () {
      this.$refs.searchInput.blur()
      const startTime = new Date()
      this.loading = true
      // this.$firebase.searchMedia({ searchTerms: this.searchTerms, searchTypes: this.types.map((e) => { return e.value }) }).then((res) => {
      //   const elapsedTime = new Date() - startTime
      //   this.$ga.time({
      //     timingCategory: 'query',
      //     timingVar: 'media',
      //     timingValue: elapsedTime,
      //     timingLabel: 'search'
      //   })
      //   this.loading = false
      //   this.items = res.data.results
      // })
      this.$firebase.search(this.searchTerms, this.types.map(e => e.value), async (results) => {
        const elapsedTime = new Date() - startTime
        this.$ga.time({
          timingCategory: 'query',
          timingVar: 'media',
          timingValue: elapsedTime,
          timingLabel: 'search'
        })
        this.loading = false
        console.log('results', results)
        this.items = await this.$firebase.idArray(results)
      })
      // this.$database.search('media', this.searchTerms, {}, (res) => {
      //   this.items = res
      // })
    },
    show () {
      console.log('mediasearch show')
      this.$refs.modal.show()
    },
    hide () {
      this.$refs.modal.hide()
    }
  }
}
</script>

<style>
.search-modal {
  width: 100vw;
  height: 100vh;
  padding: 20px;
}

.media-cardl {
  margin: 5px;
  width: 100%;
  cursor: pointer;
}
.image-cardl {
  opacity: 0.5;
  transition: opacity .25s;
  transition-timing-function: ease-in;
}
.image-cardl:hover {
  opacity: 1;
}
.media-modal {
  width: 100%;
  padding: 30px;
}
@media screen and (min-width: 800px) {
  .media-modal {
    width: 500px;
  }
  .search-modal {
    width: 500px;
    height: 50vh;
  }
}
</style>
