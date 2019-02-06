<template>
  <div v-if="open">
    <div class="row gutter-sm" v-if="!editing">
      <div class="col-12">
        <q-btn icon="fas fa-times" size="xs" color="primary" @click.native="close" class="float-right" />
        <img :src="image.imageURL" width="100%" />
      </div>
      <div class="col-12" v-if="image.tags.length > 0 || image.bibleRefs.length > 0">
        <q-chip v-for="tag in image.tags" :key="tag" color="primary">{{ tag }}</q-chip><br v-if="image.tags.length > 0 && image.bibleRefs.length > 0" /><q-chip v-for="ref in readableRefs" :key="ref" color="secondary">{{ ref }}</q-chip>
      </div>
      <div class="col-12">
        <q-btn color="primary" @click.native="editing = true" v-if="editable === ''">Edit</q-btn>
        <q-btn color="primary" v-if="addModule !== undefined" @click.native="add">Add</q-btn>
      </div>
    </div>
    <div class="row gutter-sm" v-if="editing">
      <div class="col-12">
        <img :src="image.imageURL" width="100%" />
      </div>
      <div class="col-12">
        <p><b>Location:</b> {{ image.service }}</p>
      </div>
      <div class="col-12">
        <q-chips-input v-model="image.tags" float-label="Tags" />
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
        <q-btn color="primary" @click.native="save()" v-if="!showRemove">Save</q-btn>&nbsp;
        <q-btn color="negative" @click.native="showRemove = true" v-if="!showRemove">Remove</q-btn>
        <q-alert
          v-if="showRemove"
          color="negative"
          icon="fas fa-question-circle"
          message="Are you sure?"
          detail="Removing this media will also remove it from any Messages"
          :actions="[
            { label: 'Yes', icon: 'fas fa-check', handler: () => { return remove() } },
            { label: 'Nope', icon: 'fas fa-times', handler: () => { return showRemove = false } }
          ]"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { Notify } from 'quasar'

export default {
  props: ['data', 'open', 'close', 'addModule', 'editable'],
  name: 'media-image',
  fiery: true,
  data () {
    return {
      editing: false,
      image: {
        tags: [],
        bibleRefs: []
      },
      readableRefs: [],
      showRemove: false
    }
  },
  watch: {
    'data': function (val) {
      console.log('val', val)
      if (val !== {}) {
        this.editing = false
        this.image = val
        this.readableRefs = val.bibleRefs.map(e => { return this.$bible.readable(e) })
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.image = {...this.data}
      delete this.image.id
      delete this.image.type
    },
    addRef (newRef) {
      this.image.bibleRefs = newRef.map(e => { return this.$bible.parse(e) })
      this.readableRefs = newRef.map(e => { return this.$bible.readable(e) })
    },
    save () {
      this.$fiery.update(this.image).then(() => {
        Notify.create({
          type: 'positive',
          message: 'Image saved!',
          position: 'bottom-left'
        })
        this.editing = false
      })
    },
    async remove () {
      this.editing = false
      this.close()
      if (this.image.used) {
        var proms = []
        proms.concat(...this.image.used.map(e => {
          return this.$firebase.list('message').doc(e.message).collection('modules').doc(e.module).delete()
        }))
        proms.concat(...this.image.used.map(e => {
          return this.$firebase.list('message').doc(e.message).collection('sections').doc(e.section).update({
            moduleOrder: this.$firebase.base.firestore.FieldValue.arrayRemove(e.module)
          })
        }))
        try {
          await Promise.all(proms)
        } catch (err) {
          console.error(err)
        }
      }
      this.$fiery.remove(this.image).then(() => {
        Notify.create({
          type: 'positive',
          message: 'Image removed!',
          position: 'bottom-left'
        })
      })
    },
    add () {
      this.addModule(this.data.id, 'image', this.image)
      this.close()
    }
  }
}
</script>

<style>
</style>
