<template>
  <q-page padding>
    <div class="float-right gt-sm">
      <span class="on-left">Sort By: </span>
      <q-btn-toggle
        v-model="orderBy"
        :options="[
          { label: 'Added', value: 'createdDate' },
          { label: 'Modified', value: 'modifiedDate' },
          { label: 'A-Z', value: 'title' }
        ]"
      />
      <q-btn-toggle
        v-model="orderDirection"
        class="on-right"
        :options="[
          { icon: 'fas fa-arrow-down', value: 'desc'},
          { icon: 'fas fa-arrow-up', value: 'asc' }
        ]"
      />
    </div>
    <h3>{{ capitalizeTitle(type) + (type === 'message' ? 's' :  type === 'scratch' ? ' Pad' : '') }} <q-btn size="sm" icon="fas fa-plus" color="primary" @click.native="openAdd()" /></h3>
    <div class="lt-md">
      <q-btn-toggle
        v-model="orderBy"
        :options="[
          { label: 'Added', value: 'createdDate' },
          { label: 'Modified', value: 'modifiedDate' },
          { label: 'A-Z', value: 'title' }
        ]"
      />
      <q-btn-toggle
        v-model="orderDirection"
        class="on-right"
        :options="[
          { icon: 'fas fa-arrow-up', value: 'asc' },
          { icon: 'fas fa-arrow-down', value: 'desc'}
        ]"
      />
    </div>
    <div v-if="!loading && items.length === 0">
      <p>No {{ capitalizeTitle(type) }}s...yet! Click the '+' button above to get started</p>
    </div>
    <div v-if="!loading || (contentTypes.includes(type) && items.length !== 0)">
      <q-card inline v-for="item in items" :key="item.id" class="content-card" @click.native="openItem(item.id)">
        <q-card-title class="relative-position">
          {{ item.title }}
          <q-chip v-if="item.ownedBy !== $firebase.auth.currentUser.uid" floating icon="fas fa-share-alt" color="primary" style="min-height: 28px; padding: 8px; font-size: 14px;">
            <display-name :uid="item.ownedBy" />
          </q-chip>
        </q-card-title>
        <q-card-main>
          <p>{{ item.mainIdea }}</p>
          <span v-if="item.tags.length > 0">Tags: <q-chip v-for="tag in item.tags" :key="tag" color="primary" class="list-chip" dense>{{ tag }}</q-chip></span>
          <br v-if="item.tags.length > 0 && Object.keys(item.bibleRefs).length > 0" />
          <span v-if="Object.keys(item.bibleRefs).length > 0">Bible Refs: <q-chip v-for="ref in item.bibleRefs" :key="ref" color="secondary" class="list-chip" dense>{{ $bible.readable(ref) }}</q-chip></span>
        </q-card-main>
      </q-card>
    </div>
    <div v-if="type !== 'scratch'">
      <a @click="showArchived(type)"><p class="text-light cursor-pointer" style="margin-top: 20px;">Show Archived <q-icon name="fas fa-chevron-down" /></p></a>
    </div>
    <div v-if="!loading || (contentTypes.includes(type) && archived.length !== 0)">
      <q-card inline v-for="item in archived" :key="item.id" class="content-card" @click.native="openItem(item.id)">
        <q-card-title>{{ item.title }}</q-card-title>
        <q-card-main>
          <p>{{ item.mainIdea }}</p>
          <span v-if="item.tags.length > 0">Tags: <q-chip v-for="tag in item.tags" :key="tag" color="primary" class="list-chip" dense>{{ tag }}</q-chip></span>
          <br v-if="item.tags.length > 0 && Object.keys(item.bibleRefs).length > 0" />
          <span v-if="Object.keys(item.bibleRefs).length > 0">Bible Refs: <q-chip v-for="ref in item.bibleRefs" :key="ref" color="secondary" class="list-chip" dense>{{ $bible.readable(ref) }}</q-chip></span>
        </q-card-main>
      </q-card>
    </div>
    <div v-if="loading">
      <q-spinner color="primary" class="absolute-center" size="3rem" />
    </div>
    <add-content :type="type" ref="addContent" v-if="contentTypes.includes(type)" />
  </q-page>
</template>

<script>
import AddContent from 'components/AddContent'
import DisplayName from 'components/DisplayName'
import { format } from 'quasar'
const { capitalize } = format

export default {
  components: {
    AddContent,
    DisplayName
  },
  name: 'ListContent',
  fiery: true,
  data () {
    return {
      contentTypes: ['series', 'message', 'scratch'],
      type: this.$route.params.type,
      items: [],
      archived: [],
      orderBy: 'createdDate',
      orderDirection: 'desc',
      loading: false
    }
  },
  mounted () {
    this.init(this.type)
  },
  watch: {
    '$route.params.type' (newType, oldType) {
      this.type = newType
      this.$fiery.free(this.items)
      this.$fiery.free(this.archived)
      this.archived = []
      this.init(newType)
    },
    orderBy (newType, oldType) {
      console.log('watch order', newType, oldType)
      if (newType === 'title') {
        this.orderDirection = 'asc'
      } else {
        this.orderDirection = 'desc'
      }
      this.init(this.type)
    },
    orderDirection (newDir, oldDir) {
      console.log('watch direction', newDir, oldDir)
      this.init(this.type)
    }
  },
  methods: {
    init (type) {
      this.$ga.event('content', 'list', this.$route.params.type)
      const startTime = new Date()
      this.loading = true
      this.items = this.$fiery(this.$firebase.list(type), {
        query: (items) => {
          var query = items.where('users', 'array-contains', this.$firebase.auth.currentUser.uid)
          if (type !== 'scratch') {
            query = query.where('archived', '==', false)
          }
          if (type === 'message') {
            query = query.where('seriesid', '==', '')
          }
          query = query.orderBy(this.orderBy, this.orderDirection)
          return query
        },
        key: 'id',
        exclude: ['id', 'ownedName'],
        onSuccess: () => {
          const timeElapsed = new Date() - startTime
          this.$ga.time({
            timingCategory: 'content',
            timingVar: 'list',
            timingValue: timeElapsed,
            timingLabel: type
          })
          if (this.items.length > 2 && window.FMApi.triggerPoll) {
            window.FMApi.triggerPoll()
          }
          this.loading = false
        }
      })
    },
    openItem (id, item) {
      console.log(id)
      console.log(this.type)
      if (this.contentTypes.includes(this.type)) {
        this.$router.push({ name: this.type, params: { id: id } })
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
    },
    showArchived (type) {
      const startTime = new Date()
      this.loading = true
      this.archived = this.$fiery(this.$firebase.list(type), {
        query: (items) => items.where('ownedBy', '==', this.$firebase.auth.currentUser.uid).where('archived', '==', true),
        key: 'id',
        exclude: ['id'],
        onSuccess: () => {
          const timeElapsed = new Date() - startTime
          this.$ga.time({
            timingCategory: 'query',
            timingVar: 'content',
            timingValue: timeElapsed,
            timingLabel: type + '-archived'
          })
          this.loading = false
        }
      })
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

@media screen and (min-width: 800px) {
  .content-card {
    width: 47%;
  }
}
@media screen and (min-width: 1200px) {
  .content-card {
    width: 31%;
  }
}

</style>
