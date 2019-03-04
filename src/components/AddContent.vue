<template>
  <q-modal ref="addContentModal" v-model="showAddContent" content-classes="add-content-modal">
    <q-btn
      color="primary"
      @click.native="showAddContent = false"
      icon="fas fa-times"
      class="float-right"
      size="sm"
    />
    <h4>New {{ readableType }}</h4>
    <div class="row gutter-sm">
      <div class="col-12">
        <q-field
            :error="$v.title.$error"
            error-label="Title is required"
          >
          <q-input type="text" float-label="Title" v-model="title" @blur="$v.title.$touch" @keyup.enter="add('blank')" />
        </q-field>
      </div>
      <div class="col-12">
        <q-btn color="primary" class="float-right" @click.native="add('blank')">Add Blank {{ readableType }}</q-btn>
      </div>
    </div>
  </q-modal>
</template>

<script>
import { Notify, format } from 'quasar'
import { required } from 'vuelidate/lib/validators'
const { capitalize } = format

export default {
  props: ['type', 'seriesid', 'series', 'updateSeries'],
  name: 'AddContent',
  data () {
    return {
      showAddContent: false,
      title: '',
      types: ['series', 'message', 'scratch'],
      bibleRef: ''
    }
  },
  validations: {
    title: {
      required
    }
  },
  watch: {
    'showAddContent': function () {
      this.$v.title.$reset()
    }
  },
  computed: {
    readableType: function () {
      return capitalize(this.type)
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      this.title = ''
    },
    add (template) {
      this.$v.title.$touch()
      if (this.$v.title.$error) {
        this.$q.notify('Please review fields again')
        return
      }
      if (this.types.includes(this.type)) {
        const users = this.series ? this.series.sharedWith : null
        var obj = {
          title: this.title,
          createdBy: this.$firebase.auth.currentUser.uid,
          tags: [],
          bibleRefs: [],
          users: users === null ? [this.$firebase.auth.currentUser.uid] : users
        }
        if (this.type === 'message') {
          obj.prefs = this.$root.$children[0].user.app.message.prefs['messageStructure'] || {}
          obj.template = template || ''
        }
        if (this.seriesid) {
          obj.seriesid = this.seriesid
        }
        this.$firebase.list(this.type).add(obj).then((res) => {
          // GA - Add content event
          this.$log.info(`${this.readableType} created`, res)
          this.$ga.event('content', 'add', this.type, res.id)
          this.showAddContent = false
          if (this.seriesid) {
            this.updateSeries(res.id)
          }
          Notify.create({
            message: this.readableType + ' created!',
            type: 'positive',
            position: 'bottom-left'
          })
          this.$sentry.crumb({
            category: 'content',
            message: `Added ${this.type} content: ${res.id}`,
            level: 'info'
          })
          this.$router.push({ name: this.type, params: { id: res.id } })
        })
      }
    },
    show () {
      this.showAddContent = true
    }
  }
}
</script>

<style>

.add-content-modal {
  padding: 30px;
  width: 100%;
}

@media screen and (min-width: 1200px) {
  .add-content-modal {
    min-width: 500px;
    width: 500px;
  }
}

</style>
