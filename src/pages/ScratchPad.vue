<template>
  <q-page padding>
    <div class="row gutter-md">
      <div class="col-xs-12" v-if="loading">
        <q-spinner color="primary" class="absolute-center" size="3rem" />
      </div>
      <div class="col-12" style="margin-top: 30px;" v-if="!loading">
        <editor :text.sync="scratch.text" :save="update" />
      </div>
      <div class="col-xs-12 col-md-6" v-if="!loading">
        <q-chips-input v-model="scratch.tags" float-label="Tags" @blur="update" />
      </div>
      <div class="col-xs-12 col-md-6" v-if="!loading">
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
    <q-modal v-model="removeConfirmation" ref="removeConfirmationModal" content-classes="edit-title-modal">
      <div class="row gutter-md">
        <div class="col-12">
          <q-btn
            color="primary"
            @click.native="removeConfirmation = false"
            icon="fas fa-times"
            class="float-right"
            size="sm"
          />
          <h4>Confirm Remove...</h4>
        </div>
        <div class="col-12">
          <p>Are you sure you want to remove this scratch?</p>
        </div>
        <div class="col-12">
          <q-btn color="primary" @click.native="remove">Remove</q-btn>
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
              <q-item v-close-overlay @click.native="removeConfirmation = true">Remove...</q-item>
            </q-list>
          </q-popover>
        </q-btn>
      </q-toolbar>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
import Editor from 'components/TextEditor.vue'

export default {
  components: {
    Editor
  },
  name: 'Scratch',
  fiery: true,
  data () {
    return {
      loading: true,
      id: this.$route.params.id,
      scratch: this.$fiery(this.$firebase.ref('scratch', '', this.$route.params.id), {
        onSuccess: (scratch) => {
          this.readableRefs = scratch.bibleRefs.map(e => { return this.$bible.readable(e) })
          this.loading = false
        }
      }),
      readableRefs: [],
      editTitle: false,
      removeConfirmation: false
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.$database.view('scratch', this.id, (data) => {
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
      this.$database.update('scratch', this.id, obj, (res) => {
        console.log(res)
        Notify.create({
          type: 'positive',
          message: 'Scratch updated!',
          position: 'bottom-left'
        })
      })
    },
    remove () {
      this.$fiery.remove(this.scratch)
      this.$router.push({ name: 'list', params: { type: 'scratch' } })
    }
  }
}
</script>

<style>

.q-page-sticky span {
  width: 100%;
}

</style>
