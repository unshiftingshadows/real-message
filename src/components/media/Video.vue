<template>
  <div v-if="open">
    <div class="row gutter-sm" v-if="!editing">
      <div class="col-12">
        <q-btn icon="fas fa-times" size="xs" color="primary" @click.native="close" class="float-right" />
        <q-video :src="video.embedURL" />
      </div>
      <div class="col-12">
        <p>{{ video.title }}</p>
      </div>
      <div class="col-12" v-if="video.tags.length > 0 || video.bibleRefs.length > 0">
        <q-chip v-for="tag in video.tags" :key="tag" color="primary">{{ tag }}</q-chip><br v-if="video.tags.length > 0 && video.bibleRefs.length > 0" /><q-chip v-for="ref in readableRefs" :key="ref" color="secondary">{{ ref }}</q-chip>
      </div>
      <div class="col-12">
        <q-btn color="primary" @click.native="editing = true" v-if="editable === ''">Edit</q-btn>
        <q-btn color="primary" v-if="addModule !== undefined" @click.native="add">Add</q-btn>
      </div>
    </div>
    <div class="row gutter-sm" v-if="editing">
      <div class="col-12">
        <q-video :src="video.embedURL" />
      </div>
      <div class="col-12">
        <p><b>Location:</b> {{ video.service }}</p>
      </div>
      <div class="col-12">
        <q-chips-input v-model="video.tags" float-label="Tags" />
      </div>
      <div class="col-12">
        <q-chips-input
          color="secondary"
          v-model="readableRefs"
          float-label="Bible References"
          @input="addRef"
        />
      </div>
      <div class="col-12">
        <q-btn color="primary" @click.native="save">Save</q-btn>&nbsp;
        <q-btn color="negative" @click.native="remove">Remove</q-btn>
      </div>
    </div>
  </div>
</template>

<script>
import { Notify } from 'quasar'

export default {
  props: ['data', 'open', 'close', 'addModule', 'editable'],
  name: 'media-video',
  fiery: true,
  data () {
    return {
      editing: false,
      video: {
        tags: [],
        bibleRefs: []
      },
      readableRefs: []
    }
  },
  watch: {
    'data': function (val) {
      console.log('val', val)
      if (val !== {}) {
        this.editing = false
        this.video = val
        this.readableRefs = val.bibleRefs.map(e => { return this.$bible.readable(e) })
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.video = {...this.data}
      delete this.video.id
      delete this.video.type
    },
    addRef (newRef) {
      this.video.bibleRefs = newRef.map(e => { return this.$bible.parse(e) })
      this.readableRefs = newRef.map(e => { return this.$bible.readable(e) })
    },
    save () {
      console.log(this.video)
      this.$fiery.update(this.video).then(() => {
        Notify.create({
          type: 'positive',
          message: 'Video saved!',
          position: 'bottom-left'
        })
        this.editing = false
      })
    },
    async remove () {
      this.editing = false
      this.close()
      var proms = []
      proms.concat(...this.video.used.map(e => {
        return this.$firebase.list('message').doc(e.message).collection('modules').doc(e.module).delete()
      }))
      proms.concat(...this.video.used.map(e => {
        return this.$firebase.list('message').doc(e.message).collection('sections').doc(e.section).update({
          moduleOrder: this.$firebase.base.firestore.FieldValue.arrayRemove(e.module)
        })
      }))
      try {
        await Promise.all(proms)
      } catch (err) {
        console.error(err)
      }
      this.$fiery.remove(this.video).then(() => {
        Notify.create({
          type: 'positive',
          message: 'Video removed!',
          position: 'bottom-left'
        })
      })
    },
    add () {
      this.addModule(this.data.id, 'video')
      this.close()
    }
  }
}
</script>

<style>

.q-video {
  position: relative;
  padding-bottom: 56.25%;
  padding-top: 25px;
  height: 0;
  width: 100%;
}
.q-video iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

</style>
