<template>
  <q-page padding>
    <h3>{{ capitalizeTitle(type) + (type === 'lesson' || type === 'sermon' ? 's' :  type === 'scratch' ? ' Pad' : '') }} <q-btn size="sm" icon="fa-plus" color="primary" @click.native="openAdd()" /></h3>
    <div v-if="loading">
      <q-spinner color="primary" class="absolute-center" size="3rem" />
    </div>
    <div v-if="!loading && contentTypes.includes(type)">
      <q-card inline v-for="item in items" :key="item._id" class="content-card" @click.native="openItem(item._id)">
        <q-card-title>{{ item.title }} <span v-if="type === 'archive'" class="text-weight-light uppercase q-caption">{{ capitalizeTitle(item.type) }}</span></q-card-title>
        <q-card-main>
          <p>{{ item.mainIdea }}</p>
          <span v-if="item.tags.length > 0">Tags: <q-chip v-for="tag in item.tags" :key="tag" color="primary" class="list-chip" dense>{{ tag }}</q-chip></span>
          <br v-if="item.tags.length > 0 && Object.keys(item.bibleRefs).length > 0" />
          <span v-if="Object.keys(item.bibleRefs).length > 0">Bible Refs: <q-chip v-for="ref in item.bibleRefs" :key="ref" color="secondary" class="list-chip" dense>{{ $bible.readable(ref) }}</q-chip></span>
        </q-card-main>
      </q-card>
    </div>
    <add-content :type="'o' + type" ref="addContent" v-if="contentTypes.includes(type)" />
  </q-page>
</template>

<script>
import AddContent from 'components/AddContent.vue'
import { format } from 'quasar'
const { capitalize } = format

export default {
  components: {
    AddContent
  },
  // name: 'PageName',
  data () {
    return {
      contentTypes: ['series', 'lesson', 'sermon', 'scratch', 'archive'],
      type: this.$route.params.type,
      items: [],
      loading: false
    }
  },
  mounted () {
    this.init(this.type)
  },
  watch: {
    '$route.params.type' (newType, oldType) {
      this.type = newType
      this.init(newType)
    }
  },
  methods: {
    init (type) {
      this.loading = true
      this.items = []
      this.$database.list('o' + type, (data) => {
        console.log('data', data, this)
        this.items = data
        this.loading = false
      })
    },
    openItem (id, item) {
      console.log(id)
      console.log(this.type)
      if (this.contentTypes.includes(this.type)) {
        this.$router.push({ name: 'o' + this.type, params: { id: id } })
      }
    },
    openAdd () {
      if (this.contentTypes.includes(this.type)) {
        this.$refs.addContent.show()
      } else {
        console.error('incorrect type to add')
      }
    },
    capitalizeTitle (title) {
      return capitalize(title)
    }
  }
}
</script>

<style>

.content-card {
  margin: 10px;
  width: 95%;
  cursor: pointer;
  opacity: 0.6;
  -webkit-transition-duration: .5s;
  transition-duration: .5s;
}

.content-card:hover {
  opacity: 1;
}

.list-chip {
  margin-top: 5px;
  margin-bottom: 5px;
  margin-right: 2px;
}

.add-content-modal {
  padding: 30px;
  width: 100%;
}

@media screen and (min-width: 800px) {
  .content-card {
    width: 47%;
  }
}
@media screen and (min-width: 1200px) {
  .content-card {
    width: 31%;
  }
  .add-content-modal {
    min-width: 500px;
    width: 500px;
  }
}

</style>
