<template>
  <div v-if="open">
    <div class="row gutter-sm" v-if="!editing">
      <div class="col-12">
        <q-btn icon="fas fa-times" size="xs" color="primary" @click.native="close" class="float-right" />
        <h5>{{ illustration.title }}</h5>
      </div>
      <div class="col-12">
        <p>{{ illustration.text }}</p>
      </div>
      <div class="col-12" v-if="illustration.tags.length > 0 || illustration.bibleRefs.length > 0">
        <q-chip v-for="tag in illustration.tags" :key="tag" color="primary">{{ tag }}</q-chip><br v-if="illustration.tags.length > 0 && illustration.bibleRefs.length > 0" /><q-chip v-for="ref in readableRefs" :key="ref" color="secondary">{{ ref }}</q-chip>
      </div>
      <div class="col-12">
        <q-btn color="primary" @click.native="editing = true" v-if="editable === ''">Edit</q-btn>
        <q-btn color="primary" v-if="addModule !== undefined" @click.native="add">Add</q-btn>
      </div>
    </div>
    <div class="row gutter-sm" v-if="editing">
      <div class="col-12">
        <q-input v-model="illustration.title" float-label="Title" type="text" />
      </div>
      <div class="col-12">
        <q-input v-model="illustration.text" float-label="Illustration" type="textarea" :max-height="100" :min-rows="1" />
      </div>
      <div class="col-12">
        <q-chips-input v-model="illustration.tags" float-label="Tags" />
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
  name: 'media-illustration',
  fiery: true,
  data () {
    return {
      editing: false,
      illustration: {
        tags: [],
        bibleRefs: []
      },
      readableRefs: [],
      showRemove: false
    }
  },
  watch: {
    'data': function (val) {
      if (val !== {}) {
        this.editing = false
        this.illustration = val
        this.readableRefs = val.bibleRefs.map(e => { return this.$bible.readable(e) })
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.illustration = {...this.data}
      delete this.illustration.id
      delete this.illustration.type
    },
    addRef (newRef) {
      this.illustration.bibleRefs = newRef.map(e => { return this.$bible.parse(e) })
      this.readableRefs = newRef.map(e => { return this.$bible.readable(e) })
    },
    save () {
      this.$fiery.update(this.illustration).then(() => {
        this.$log.info('Media updated', { id: this.data.id, type: 'illustration' })
        Notify.create({
          type: 'positive',
          message: 'Illustration saved!',
          position: 'bottom-left'
        })
        this.editing = false
      })
    },
    async remove () {
      this.editing = false
      this.close()
      if (this.illustration.used) {
        var proms = []
        proms.concat(...this.illustration.used.map(e => {
          return this.$firebase.list('message').doc(e.message).collection('modules').doc(e.module).delete()
        }))
        proms.concat(...this.illustration.used.map(e => {
          return this.$firebase.list('message').doc(e.message).collection('sections').doc(e.section).update({
            moduleOrder: this.$firebase.base.firestore.FieldValue.arrayRemove(e.module)
          })
        }))
        try {
          await Promise.all(proms)
        } catch (err) {
          this.$log.error('Illustration used error', err)
        }
      }
      this.$fiery.remove(this.illustration).then(() => {
        this.$log.info('Media removed', { id: this.data.id, type: 'illustration' })
        Notify.create({
          type: 'positive',
          message: 'Illustration removed!',
          position: 'bottom-left'
        })
      })
    },
    add () {
      this.addModule(this.data.id, 'illustration', this.illustration)
      this.close()
    }
  }
}
</script>

<style>
</style>
