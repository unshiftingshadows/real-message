<template>
  <q-page padding>
    <div class="row gutter-md items-center">
      <div class="col-12" v-if="loading">
        <q-spinner color="primary" class="absolute-center" size="3rem" />
      </div>
      <div class="col-12" v-if="!loading">
        <q-input v-model="sermon.mainIdea" float-label="Main Idea" type="textarea" :max-height="100" :min-rows="1" @blur="update" />
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
      <div class="col-xs-12 col-md-6" v-if="!loading">
        <q-chips-input v-model="sermon.tags" float-label="Tags" @blur="update" />
      </div>
      <div v-if="!sermon.sectionOrder">
        <q-spinner color="primary" class="absolute-center" size="3rem" />
      </div>
      <div class="col-12" v-if="sermon.sectionOrder">
        <content-editor :key="id" :id="id" type="sermon" />
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
          <q-input v-model="sermon.title" />
        </div>
        <div class="col-12">
          <q-btn color="primary" @click.native="update">Save</q-btn>
        </div>
      </div>
    </q-modal>
    <q-modal v-model="showPreview" ref="previewModal" content-classes="preview-modal" maximized>
      <div class="row gutter-md justify-center" v-if="showPreview">
        <div class="col-xs-12 col-md-8">
          <q-btn
            color="primary"
            @click.native="showPreview = false"
            icon="fas fa-times"
            class="float-right"
            size="sm"
          />
          <h2>{{ sermon.title }}</h2>
        </div>
        <div class="col-xs-12 col-md-8">
          <h3>Main Idea</h3>
          <h6>{{ sermon.mainIdea }}</h6>
        </div>
        <div class="col-xs-12 col-md-8">
          <content-preview :id="id" type="sermon" />
        </div>
      </div>
    </q-modal>
    <q-modal v-model="archiveConfirmation" ref="archiveConfirmationModal" content-classes="edit-title-modal">
      <div class="row gutter-md">
        <div class="col-12">
          <q-btn
            color="primary"
            @click.native="archiveConfirmation = false"
            icon="fas fa-times"
            class="float-right"
            size="sm"
          />
          <h4>Confirm Archive...</h4>
        </div>
        <div class="col-12">
          <p>Are you sure you want to archive this sermon? It will still be accessible from the archive menu, but you will no longer be able to edit, share, or present.</p>
        </div>
        <div class="col-12">
          <q-btn color="warning" @click.native="archive">Archive</q-btn>
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
          <p>Are you sure you want to <b>permanently</b> remove this sermon? It will <b>no longer be accessible</b>.</p>
        </div>
        <div class="col-12">
          <q-btn color="negative" @click.native="remove">Remove</q-btn>
        </div>
      </div>
    </q-modal>
    <q-page-sticky position="top">
      <q-toolbar color="secondary" style="z-index: 10;">
        <q-toolbar-title>
          {{ sermon.title }}
        </q-toolbar-title>
        <q-chip color="warning" class="on-left" v-if="sermon.archived">Archived</q-chip>
        <q-btn icon="fas fa-ellipsis-v" color="primary" class="float-right">
          <q-popover anchor="bottom right" self="top right">
            <q-list link>
              <q-item v-close-overlay @click.native="editTitle = true">Rename...</q-item>
              <q-item v-close-overlay @click.native="showPreview = true">Preview</q-item>
              <q-item-separator />
              <q-item v-close-overlay><q-toggle label="Hook" v-model="sermon.prefs.hook" /></q-item>
              <q-item v-close-overlay><q-toggle label="Application" v-model="sermon.prefs.application" /></q-item>
              <q-item v-close-overlay><q-toggle label="Prayer" v-model="sermon.prefs.prayer" /></q-item>
              <q-item-separator />
              <q-item v-close-overlay v-if="!sermon.archived" @click.native="archiveConfirmation = true">Archive...</q-item>
              <q-item v-close-overlay v-if="sermon.archived" @click.native="removeConfirmation = true" class="text-negative">Remove...</q-item>
              <q-item v-close-overlay v-if="!sermon.archived">Collaborate...</q-item>
              <!-- <q-item v-close-overlay>Print...</q-item> -->
              <!-- <q-item v-close-overlay>Present...</q-item> -->
            </q-list>
          </q-popover>
        </q-btn>
      </q-toolbar>
      <div class="main-idea-tab float-right" v-bind:class="{ 'main-idea-show': showMainIdea }">
        {{ sermon.mainIdea }}
      </div>
    </q-page-sticky>
    <q-scroll-observable @scroll="userHasScrolled" />
  </q-page>
</template>

<script>
import { Notify } from 'quasar'
import ContentEditor from 'components/ContentEditor.vue'
import ContentPreview from 'components/ContentPreview.vue'

export default {
  components: {
    ContentEditor,
    ContentPreview
  },
  name: 'Sermon',
  fiery: true,
  data () {
    return {
      loading: true,
      id: this.$route.params.id,
      sermon: this.$fiery(this.$firebase.ref('sermon', '', this.$route.params.id), {
        onSuccess: (sermon) => {
          this.readableRefs = sermon.bibleRefs.map(e => { return this.$bible.readable(e) })
          this.loading = false
        }
      }),
      seriesName: '',
      readableRefs: [],
      editTitle: false,
      updating: true,
      showPreview: false,
      archiveConfirmation: false,
      removeConfirmation: false,
      showMainIdea: false
    }
  },
  mounted () {
    this.init()
  },
  watch: {
    'sermon.prefs.hook': function (newHook) {
      // this.$firebase.ref('sermon', 'structure/before', this.id).child('hook').update({ show: newHook })
      this.update()
    },
    'sermon.prefs.application': function (newApplication) {
      // this.$firebase.ref('sermon', 'structure/after', this.id).child('application').update({ show: newApplication })
      this.update()
    },
    'sermon.prefs.prayer': function (newPrayer) {
      // this.$firebase.ref('sermon', 'structure/after', this.id).child('prayer').update({ show: newPrayer })
      this.update()
    }
  },
  methods: {
    init () {
    },
    addRef (newRef) {
      this.sermon.bibleRefs = newRef.map(e => { return this.$bible.parse(e) })
      this.readableRefs = newRef.map(e => { return this.$bible.readable(e) })
    },
    selected (item) {
      this.seriesName = item.label
      this.sermon.seriesID = item.value
      this.update()
    },
    update () {
      // Call update function from database
      console.log('update!')
      this.editTitle = false
      this.$fiery.update(this.sermon).then(() => {
        Notify.create({
          type: 'positive',
          message: 'Sermon Updated!',
          position: 'bottom-left'
        })
      })
    },
    archive () {
      console.log('archive!')
      this.archiveConfirmation = false
      this.sermon.archived = true
      this.$fiery.update(this.sermon)
      this.$router.push({ name: 'list', params: { type: 'sermon' } })
    },
    remove () {
      this.removeConfirmation = false
      this.$fiery.remove(this.sermon)
      this.$router.push({ name: 'list', params: { type: 'sermon' } })
    },
    userHasScrolled (scroll) {
      if (scroll.position < 30) {
        this.showMainIdea = false
      } else {
        this.showMainIdea = true
      }
    }
  }
}
</script>

<style>

.q-page-sticky span {
  width: 100%;
}

.main-idea-tab {
  background-color: #777;
  z-index: 5;
  width: 100%;
  padding: 20px;
  margin-top: -200px;
  opacity: 0;
  transition: margin-top 2s, opacity 2s;
  -webkit-transition: margin-top 2s, opacity 2s;
}

.main-idea-show {
  margin-top: 0px;
  opacity: 1;
}

@media screen and (min-width: 800px) {
  .main-idea-tab {
    width: 50%;
  }
}

@media screen and (min-width: 1200px) {
  .main-idea-tab {
    width: 30%;
  }
}

.edit-title-modal, .preview-modal {
  padding: 30px;
  width: 100%;
}

@media screen and (min-width: 1200px) {
  .edit-title-modal {
    min-width: 500px;
    width: 500px;
  }
}

</style>
