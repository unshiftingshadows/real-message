<template>
  <q-page padding>
    <div class="row gutter-md items-center">
      <div class="col-xs-12" v-if="loading">
        <q-spinner color="primary" class="absolute-center" size="3rem" />
      </div>
      <div class="col-12" v-if="!loading" style="margin-top: 20px;">
        <q-input v-model="series.mainIdea" float-label="Main Idea" type="textarea" :max-height="100" :min-rows="1" @blur="update()" :readonly="!fullAccess" />
      </div>
      <div class="col-xs-12 col-md-6" v-if="!loading">
        <q-chips-input
          color="secondary"
          v-model="readableRefs"
          float-label="Bible References"
          @input="addRef"
          :readonly="!fullAccess"
        />
      </div>
      <div class="col-xs-12 col-md-6" v-if="!loading">
        <q-chips-input v-model="series.tags" float-label="Tags" @input="update()" :readonly="!fullAccess" />
      </div>
      <div v-if="!series.messageOrder">
        <q-spinner color="primary" class="absolute-center" size="3rem" />
      </div>
      <div class="col-12" v-if="series.messageOrder">
        <message-list :seriesid="id" :series="series" :message-order="series.messageOrder" :update="update" />
      </div>
    </div>
    <add-content type="message" :seriesid="id" :series="series" ref="addContent" :update-series="update" />
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
          <q-input v-model="series.title" />
        </div>
        <div class="col-12">
          <q-btn color="primary" @click.native="update">Save</q-btn>
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
          <!-- TODO: Archiving a series should probably work differently than archiving a message...
                     might want to offer only archiving (or deleting?) the series and saving the messages
                     as one-offs -->
          <p>Are you sure you want to archive this series? It will still be accessible from the archive menu, but you will no longer be able to edit, share, or present.</p>
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
          <p>Are you sure you want to <b>permanently</b> remove this series? It will <b>no longer be accessible</b>.</p>
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
          <h4>Share this Series with...</h4>
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
    <q-page-sticky expand position="top">
      <q-toolbar color="secondary" style="z-index: 10;">
        <q-toolbar-title>
          {{ series.title }}
        </q-toolbar-title>
        <q-chip color="warning" class="on-left" v-if="series.archived">Archived</q-chip>
        <q-btn icon="fas fa-ellipsis-v" color="primary" class="float-right" v-if="fullAccess">
          <q-popover anchor="bottom right" self="top right">
            <q-list link>
              <q-item v-close-overlay @click.native="editTitle = true">Rename...</q-item>
              <q-item-separator />
              <q-item v-close-overlay @click.native="$refs.addContent.show()">Add Message</q-item>
              <q-item-separator />
              <q-item v-close-overlay v-if="!series.archived" @click.native="archiveConfirmation = true">Archive...</q-item>
              <q-item v-close-overlay v-if="series.archived" @click.native="removeConfirmation = true" class="text-negative">Remove...</q-item>
              <q-item v-close-overlay v-if="!series.archived" @click.native="showCollab = true">Collaborate...</q-item>
              <!-- <q-item v-close-overlay>Print...</q-item> -->
              <!-- <q-item v-close-overlay>Present...</q-item> -->
            </q-list>
          </q-popover>
        </q-btn>
      </q-toolbar>
      <div class="main-idea-tab float-right" v-bind:class="{ 'main-idea-show': showMainIdea }">
        {{ series.mainIdea }}
      </div>
    </q-page-sticky>
    <q-scroll-observable @scroll="userHasScrolled" />
  </q-page>
</template>

<script>
import { required, email } from 'vuelidate/lib/validators'
import { Notify } from 'quasar'
import MessageList from 'components/MessageList.vue'
import AddContent from 'components/AddContent.vue'

export default {
  components: {
    MessageList,
    AddContent
  },
  name: 'Series',
  fiery: true,
  data () {
    return {
      loading: true,
      id: this.$route.params.id,
      series: this.$fiery(this.$firebase.ref('series', '', this.$route.params.id), {
        onSuccess: (series) => {
          this.readableRefs = series.bibleRefs.map(e => { return this.$bible.readable(e) })
          this.loading = false
        }
      }),
      readableRefs: [],
      editTitle: false,
      archiveConfirmation: false,
      removeConfirmation: false,
      showCollab: false,
      collabEmail: '',
      showMainIdea: false
    }
  },
  computed: {
    fullAccess: function () {
      if (this.series && this.series.sharedWith) {
        return this.series.sharedWith.includes(this.$firebase.auth.currentUser.uid)
      } else {
        return false
      }
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
      this.$ga.event('series', 'view', this.$route.params.id)
    },
    addRef (newRef) {
      this.series.bibleRefs = newRef.map(e => { return this.$bible.parse(e) })
      this.readableRefs = newRef.map(e => { return this.$bible.readable(e) })
      this.update()
    },
    update (messageid) {
      if (!this.fullAccess) {
        Notify.create({
          type: 'negative',
          message: 'Not authorized to update Series',
          position: 'bottom-left'
        })
        return
      }
      console.log('update!')
      this.$ga.event('series', 'update', this.$route.params.id)
      if (messageid) {
        this.series.messageOrder.push(messageid)
      }
      this.editTitle = false
      this.series.modifiedDate = new Date()
      this.series.modifiedBy = this.$firebase.auth.currentUser.uid
      this.$fiery.update(this.series).then(() => {
        Notify.create({
          type: 'positive',
          message: 'Series Updated!',
          position: 'bottom-left'
        })
      })
    },
    archive () {
      if (!this.fullAccess) {
        Notify.create({
          type: 'negative',
          message: 'Not authorized to update Series',
          position: 'bottom-left'
        })
        return
      }
      console.log('archive!')
      this.$ga.event('series', 'archive', this.$route.params.id)
      this.archiveConfirmation = false
      this.series.archived = true
      this.series.modifiedDate = new Date()
      this.series.modifiedBy = this.$firebase.auth.currentUser.uid
      this.$fiery.update(this.series)
      this.$router.push({ name: 'list', params: { type: 'series' } })
    },
    remove () {
      if (!this.fullAccess) {
        Notify.create({
          type: 'negative',
          message: 'Not authorized to update Series',
          position: 'bottom-left'
        })
        return
      }
      this.$ga.event('series', 'remove', this.$route.params.id)
      this.removeConfirmation = false
      this.$fiery.remove(this.series)
      this.$router.push({ name: 'list', params: { type: 'series' } })
    },
    share () {
      if (!this.fullAccess) {
        Notify.create({
          type: 'negative',
          message: 'Not authorized to update Series',
          position: 'bottom-left'
        })
        return
      }
      this.$v.collabEmail.$touch()
      if (this.$v.collabEmail.$error) {
        return
      }
      this.showCollab = false
      const email = this.collabEmail.split(', ')
      this.collabEmail = ''
      this.$firebase.addDocUser('series', this.id, email).then(async (res) => {
        console.log(res)
        if (res.data.success) {
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
