<template>
  <div v-if="open">
    <div class="row gutter-sm" v-if="!editing && editonly !== ''">
      <div class="col-12">
        <q-btn icon="fas fa-times" size="xs" color="primary" @click.native="close" class="float-right" />
        <p>{{ quote.text }}</p>
      </div>
      <div class="col-12" v-if="quote.title || quote.author">
        <p>{{ quote.title }} | {{ quote.author }}</p>
      </div>
      <div class="col-12" v-if="quote.tags.length > 0 || quote.bibleRefs.length > 0">
        <q-chip v-for="tag in quote.tags" :key="tag" color="primary">{{ tag }}</q-chip><br v-if="quote.tags.length > 0 && quote.bibleRefs.length > 0" /><q-chip v-for="ref in readableRefs" :key="ref" color="secondary">{{ ref }}</q-chip>
      </div>
      <div class="col-12">
        <q-btn color="primary" @click.native="editing = true" v-if="editable === ''">Edit</q-btn>
        <q-btn color="primary" v-if="addModule !== undefined" @click.native="add">Add</q-btn>
      </div>
    </div>
    <div class="row gutter-sm" v-if="editing || editonly === ''">
      <div class="col-12">
        <q-input v-model="quote.text" float-label="Quote" type="textarea" :max-height="100" :min-rows="1" />
      </div>
      <div class="col-xs-12 col-md-6">
        <q-input v-model="quote.title" float-label="Title" type="text" />
      </div>
      <div class="col-xs-12 col-md-6">
        <q-input v-model="quote.author" float-label="Author" type="text" />
      </div>
      <div class="col-12">
        <q-chips-input v-model="quote.tags" float-label="Tags" />
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
        <q-btn color="negative" @click.native="showRemove = true" v-if="!showRemove && editonly !== ''">Remove</q-btn>
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
  props: ['data', 'open', 'close', 'addModule', 'editable', 'editonly'],
  name: 'media-quote',
  fiery: true,
  data () {
    return {
      editing: false,
      quote: {
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
        this.quote = val
        this.readableRefs = val.bibleRefs.map(e => { return this.$bible.readable(e) })
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.quote = {...this.data}
      delete this.quote.id
      delete this.quote.type
    },
    addRef (newRef) {
      this.quote.bibleRefs = newRef.map(e => { return this.$bible.parse(e) })
      this.readableRefs = newRef.map(e => { return this.$bible.readable(e) })
    },
    save () {
      this.$fiery.update(this.quote).then(() => {
        this.$log.info('Media updated', { id: this.data.id, type: 'quote' })
        Notify.create({
          type: 'positive',
          message: 'Quote saved!',
          position: 'bottom-left'
        })
        this.editing = false
        if (this.editonly === '') {
          this.close()
        }
      })
    },
    async remove () {
      this.editing = false
      this.close()
      if (this.quote.used) {
        var proms = []
        proms.concat(...this.quote.used.map(e => {
          return this.$firebase.list('message').doc(e.message).collection('modules').doc(e.module).delete()
        }))
        proms.concat(...this.quote.used.map(e => {
          return this.$firebase.list('message').doc(e.message).collection('sections').doc(e.section).update({
            moduleOrder: this.$firebase.base.firestore.FieldValue.arrayRemove(e.module)
          })
        }))
        try {
          await Promise.all(proms)
        } catch (err) {
          this.$log.error('Quote used error', err)
        }
      }
      this.$fiery.remove(this.quote).then(() => {
        this.$log.info('Media removed', { id: this.data.id, type: 'quote' })
        Notify.create({
          type: 'positive',
          message: 'Quote removed!',
          position: 'bottom-left'
        })
      })
    },
    add () {
      this.addModule(this.data.id, 'quote')
      this.close()
    }
  }
}
</script>

<style>
</style>
