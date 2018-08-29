<template>
  <q-page padding>
    <div class="row gutter-md">
      <div class="col-12">
      </div>
      <div class="col-12">
        <editor :text.sync="scratch.text" :save="update" />
      </div>
      <div class="col-xs-12 col-md-6">
        <q-chips-input v-model="scratch.tags" float-label="Tags" @blur="update" />
      </div>
      <div class="col-xs-12 col-md-6">
        <q-chips-input
          color="secondary"
          v-model="readableRefs"
          float-label="Bible References"
          @blur="update"
          @input="addRef"
        />
      </div>
    </div>
    <q-modal v-model="editTitle" ref="editTitleModal" content-classes="edit-title-modal">
      <div class="row gutter-md">
        <div class="col-12">
          <q-btn
            color="primary"
            @click.native="editTitle = false"
            icon="fas fa-times"
            class="float-right"
            size="sm"
          />
          <h4>Edit Title</h4>
        </div>
        <div class="col-12">
          <q-input v-model="scratch.title" />
        </div>
        <div class="col-12">
          <q-btn color="primary" @click.native="update">Save</q-btn>
        </div>
      </div>
    </q-modal>
    <q-page-sticky position="top">
      <q-toolbar color="secondary" style="z-index: 10;">
        <q-toolbar-title>
          {{ scratch.title }}
        </q-toolbar-title>
        <q-btn icon="fas fa-ellipsis-v" color="primary" class="float-right">
          <q-popover anchor="bottom right" self="top right">
            <q-list link>
              <q-item v-close-overlay @click.native="editTitle = true">Rename...</q-item>
              <q-item v-close-overlay>Convert to Sermon</q-item>
              <q-item v-close-overlay>Convert to Lesson</q-item>
              <!-- <q-item v-close-overlay>Archive</q-item> -->
            </q-list>
          </q-popover>
        </q-btn>
      </q-toolbar>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
import Editor from 'components/Editor.vue'

export default {
  components: {
    Editor
  },
  // name: 'PageName',
  data () {
    return {
      id: this.$route.params.id,
      scratch: {
        tags: [],
        bibleRefs: []
      },
      readableRefs: [],
      editTitle: false
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.$database.view('oscratch', this.id, (data) => {
        this.scratch = data
        this.readableRefs = data.bibleRefs.map(e => { return this.$bible.readable(e) })
      })
    },
    addRef (newRef) {
      this.scratch.bibleRefs = newRef.map(e => { return this.$bible.parse(e) })
      this.readableRefs = newRef.map(e => { return this.$bible.readable(e) })
    },
    update () {
      console.log('update!')
      this.editTitle = false
      var obj = {
        title: this.scratch.title,
        text: this.scratch.text,
        tags: this.scratch.tags,
        bibleRefs: this.scratch.bibleRefs
      }
      this.$database.update('oscratch', this.id, obj, (res) => {
        console.log(res)
        Notify.create({
          type: 'positive',
          message: 'Scratch updated!',
          position: 'bottom-left'
        })
      })
    }
  }
}
</script>

<style>

.q-page-sticky span {
  width: 100%;
}

</style>
