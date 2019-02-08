<template>
  <q-page padding>
    <div class="row gutter-md items-center">
      <div class="col-xs-12" v-if="loading">
        <q-spinner color="primary" class="absolute-center" size="3rem" />
      </div>
      <div class="col-12" v-if="!loading" style="margin-top: 20px;">
        <q-input v-model="message.mainIdea" float-label="Main Idea" type="textarea" :max-height="100" :min-rows="1" @blur="update" />
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
        <q-chips-input v-model="message.tags" float-label="Tags" @blur="update" />
      </div>
      <div v-if="!message.sectionOrder">
        <q-spinner color="primary" class="absolute-center" size="3rem" />
      </div>
      <div class="col-12" v-if="message.sectionOrder">
        <content-editor :key="id" :id="id" :type="message.type" />
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
          <q-input v-model="message.title" />
        </div>
        <div class="col-12">
          <q-btn color="primary" @click.native="update">Save</q-btn>
        </div>
      </div>
    </q-modal>
    <!-- <q-modal v-model="showPreview" ref="previewModal" content-classes="preview-modal" maximized>
      <div class="row gutter-md justify-center" v-if="showPreview">
        <div class="col-xs-12 col-md-8">
          <q-btn
            color="primary"
            @click.native="showPreview = false"
            icon="fas fa-times"
            class="float-right"
            size="sm"
          />
          <h2>{{ message.title }}</h2>
        </div>
        <div class="col-xs-12 col-md-8">
          <h3>Main Idea</h3>
          <h6>{{ message.mainIdea }}</h6>
        </div>
        <div class="col-xs-12 col-md-8">
          <content-preview :id="id" type="message" />
        </div>
      </div>
    </q-modal> -->
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
          <p>Are you sure you want to archive this message? It will still be accessible from the archive menu, but you will no longer be able to edit, share, or present.</p>
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
          <p>Are you sure you want to <b>permanently</b> remove this message? It will <b>no longer be accessible</b>.</p>
        </div>
        <div class="col-12">
          <q-btn color="negative" @click.native="remove">Remove</q-btn>
        </div>
      </div>
    </q-modal>
    <q-modal v-model="showCollab" ref="collabModal" content-classes="edit-title-modal">
      <div class="row gutter-md">
        <div class="col-12">
          <q-btn
            color="primary"
            @click.native="showCollab = false; collabEmail = ''"
            icon="fas fa-times"
            class="float-right"
            size="sm"
          />
          <h4>Share this Message with...</h4>
        </div>
        <div class="col-12">
          <q-field
            :error="$v.collabEmail.$error && collabEmail !== ''"
            error-label="Please enter a valid email address"
          >
            <q-input
              float-label="Email"
              placeholder="Enter a user's email here..."
              type="email"
              v-model="collabEmail"
              @blur="$v.collabEmail.$touch"
              @keyup.enter="share()"
            />
          </q-field>
          <div class="q-caption" style="margin-top: 10px;">If the email address you enter is not associated with a current user, we will send them an invite to join!</div>
        </div>
        <div class="col-12">
          <q-btn color="primary" @click.native="share()">Share</q-btn>
        </div>
      </div>
    </q-modal>
    <q-page-sticky position="top">
      <q-toolbar color="secondary" style="z-index: 10;">
        <q-toolbar-title>
          {{ message.title }}
        </q-toolbar-title>
        <q-chip color="warning" class="on-left" v-if="message.archived">Archived</q-chip>
        <q-btn icon="fas fa-ellipsis-v" color="primary" class="float-right" v-if="message.prefs">
          <q-popover anchor="bottom right" self="top right">
            <q-list link>
              <q-item v-close-overlay @click.native="editTitle = true">Rename...</q-item>
              <q-item v-close-overlay @click.native="$root.$emit('preview-document', id)">Preview</q-item>
              <q-item-separator />
              <q-item v-close-overlay><q-toggle label="Hook" v-model="message.prefs.hook" @input="update()" /></q-item>
              <q-item v-close-overlay><q-toggle label="Application" v-model="message.prefs.application" @input="update()" /></q-item>
              <q-item v-close-overlay><q-toggle label="Prayer" v-model="message.prefs.prayer" @input="update()" /></q-item>
              <q-item-separator />
              <q-item v-close-overlay v-if="!message.archived" @click.native="archiveConfirmation = true">Archive...</q-item>
              <q-item v-close-overlay v-if="message.archived" @click.native="removeConfirmation = true" class="text-negative">Remove...</q-item>
              <q-item v-close-overlay v-if="!message.archived" @click.native="showCollab = true">Collaborate...</q-item>
              <!-- <q-item v-close-overlay>Print...</q-item> -->
              <!-- <q-item v-close-overlay>Present...</q-item> -->
            </q-list>
          </q-popover>
        </q-btn>
      </q-toolbar>
      <div class="main-idea-tab float-right" v-bind:class="{ 'main-idea-show': showMainIdea }">
        {{ message.mainIdea }}
      </div>
    </q-page-sticky>
    <comment-popover />
    <q-scroll-observable @scroll="userHasScrolled" />
  </q-page>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'
import { Notify } from 'quasar'
import ContentEditor from 'components/ContentEditor.vue'
import ContentPreview from 'components/ContentPreview.vue'
import CommentPopover from 'components/CommentPopover.vue'

export default {
  components: {
    ContentEditor,
    ContentPreview,
    CommentPopover
  },
  name: 'Message',
  fiery: true,
  data () {
    return {
      loading: true,
      id: this.$route.params.id,
      message: this.$fiery(this.$firebase.ref('message', '', this.$route.params.id), {
        onSuccess: (message) => {
          this.readableRefs = message.bibleRefs.map(e => { return this.$bible.readable(e) })
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
      showCollab: false,
      collabEmail: '',
      showMainIdea: false
    }
  },
  validations: {
    collabEmail: {
      required,
      email
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.$ga.event('message', 'view', this.$route.params.id)
    },
    addRef (newRef) {
      this.message.bibleRefs = newRef.map(e => { return this.$bible.parse(e) })
      this.readableRefs = newRef.map(e => { return this.$bible.readable(e) })
    },
    selected (item) {
      this.seriesName = item.label
      this.message.seriesID = item.value
      this.update()
    },
    update () {
      // Call update function from database
      console.log('update!')
      this.$ga.event('message', 'update', this.$route.params.id)
      this.editTitle = false
      this.message.modifiedDate = new Date()
      this.message.modifiedBy = this.$firebase.auth.currentUser.uid
      this.$fiery.update(this.message).then(() => {
        Notify.create({
          type: 'positive',
          message: 'Message Updated!',
          position: 'bottom-left'
        })
      })
    },
    async archive () {
      console.log('archive!')
      this.$ga.event('message', 'archive', this.$route.params.id)
      if (this.message.seriesid !== '') {
        await this.$firebase.ref('series', '', this.message.seriesid).update({
          messageOrder: this.$firebase.base.firestore.FieldValue.arrayRemove(this.id)
        })
      }
      this.archiveConfirmation = false
      this.message.archived = true
      this.message.seriesid = ''
      this.message.modifiedDate = new Date()
      this.message.modifiedBy = this.$firebase.auth.currentUser.uid
      this.$fiery.update(this.message)
      this.$router.push({ name: 'list', params: { type: 'message' } })
    },
    remove () {
      this.$ga.event('message', 'remove', this.$route.params.id)
      this.removeConfirmation = false
      this.$fiery.remove(this.message)
      this.$router.push({ name: 'list', params: { type: 'message' } })
    },
    share () {
      this.$v.collabEmail.$touch()
      if (this.$v.collabEmail.$error) {
        return
      }
      this.showCollab = false
      const email = this.collabEmail.split(', ')
      this.collabEmail = ''
      this.$firebase.addDocUser('message', this.id, email).then(async (res) => {
        console.log(res)
        if (res.data && res.data.success) {
          Notify.create({
            type: 'positive',
            message: `${email.length > 1 ? 'Invites' : 'Invite'} sent to: ${email.join(', ')}`,
            position: 'bottom-left'
          })
        }
      })
      console.log('share!')
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
  color: #fff;
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

.edit-title-modal {
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
