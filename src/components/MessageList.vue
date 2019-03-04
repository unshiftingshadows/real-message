<template>
  <div>
    <h4>Messages <q-btn v-if="fullAccess" icon="fas fa-plus" color="primary" size="sm" @click.native="$refs.addContent.show()" /></h4>
    <div v-if="!loading && Object.keys(items).length > 0">
      <draggable v-if="messageOrder.length > 0 && Object.keys(items).length > 0" style="min-height: 20px;" :list="messageOrder" @change="order()" ref="messageDrag" :options="{ ghostClass: 'message-ghost', handle: '.drag-handle', disabled: ($q.platform.is.mobile && !$q.platform.is.ipad) || !fullAccess }">
        <q-card inline v-for="message in visibleItems" :key="message.id" class="content-card" @click.native="openItem(message.id)">
          <div class="round-borders bg-primary drag-handle" v-if="(!$q.platform.is.mobile || $q.platform.is.ipad) && fullAccess">
            <q-icon name="fas fa-arrows-alt" size="1rem" />
          </div>
          <q-card-title>{{ message.title }}</q-card-title>
          <q-card-main>
            <p>{{ message.mainIdea }}</p>
            <span v-if="message.tags.length > 0">Tags: <q-chip v-for="tag in message.tags" :key="tag" color="primary" class="list-chip" dense>{{ tag }}</q-chip></span>
            <br v-if="message.tags.length > 0 && Object.keys(message.bibleRefs).length > 0" />
            <span v-if="message.bibleRefs.length > 0">Bible Refs: <q-chip v-for="ref in message.bibleRefs" :key="ref" color="secondary" class="list-chip" dense>{{ $bible.readable(ref) }}</q-chip></span>
          </q-card-main>
        </q-card>
      </draggable>
    </div>
    <add-content type="message" :seriesid="seriesid" :series="series" ref="addContent" :update-series="update" />
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import AddContent from 'components/AddContent'

export default {
  components: {
    Draggable,
    AddContent
  },
  name: 'MessageList',
  props: [ 'seriesid', 'messageOrder', 'update', 'series' ],
  fiery: true,
  data () {
    return {
      loading: true,
      items: []
    }
  },
  computed: {
    visibleItems: function () {
      return this.messageOrder.filter(e => { return this.items[e] }).map(f => { return this.items[f] })
    },
    fullAccess: function () {
      return this.series.sharedWith.includes(this.$firebase.auth.currentUser.uid)
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      const startTime = new Date()
      this.loading = true
      this.items = this.$fiery(this.$firebase.list('message'), {
        query: (items) => items.where('users', 'array-contains', this.$firebase.auth.currentUser.uid).where('seriesid', '==', this.seriesid).where('archived', '==', false),
        map: true,
        key: 'id',
        exclude: ['id'],
        onSuccess: () => {
          const timeElapsed = new Date() - startTime
          this.$ga.time({
            timingCategory: 'query',
            timingVar: 'content',
            timingValue: timeElapsed,
            timingLabel: 'series-messages'
          })
          this.loading = false
        }
      })
    },
    openItem (id) {
      this.$router.push({ name: 'message', params: { id: id } })
    },
    order () {
      this.update()
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

.drag-handle {
  float: left;
  height: 60px;
  margin-right: -5px;
  padding-top: 20px;
  padding-left: 4px;
  padding-right: 4px;
  opacity: 0.5;
  cursor: move;
}

.drag-handle:hover {
  opacity: .7;
}

.message-ghost {
  width: 2px !important;
  height: 100px !important;
  margin: 3px !important;
  background-color: var(--q-color-primary) !important;
  opacity: 0.7 !important;
}

.message-ghost.content-card > div {
  display: none !important;
}

.message-drag {
  display: block;
}

</style>
