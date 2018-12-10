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
          <q-input type="text" float-label="Title" v-model="title" @blur="$v.title.$touch" />
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
  props: ['type', 'seriesid', 'updateSeries'],
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
        var obj = {
          title: this.title,
          createdBy: this.$firebase.auth.currentUser.uid,
          tags: [],
          bibleRefs: []
        }
        if (this.type === 'message') {
          obj.prefs = this.$root.$children[0].user.app.message.prefs['messageStructure'] || {}
          obj.template = template || ''
        }
        if (this.seriesid) {
          obj.seriesid = this.seriesid
        }
        console.log(obj)
        this.$firebase.list(this.type).add(obj).then((res) => {
          // GA - Add content event
          this.$ga.event('content', 'add', this.type)
          this.showAddContent = false
          if (this.seriesid) {
            this.updateSeries(res.id)
          }
          Notify.create({
            message: this.readableType + ' created!',
            type: 'positive',
            position: 'bottom-left'
          })
          console.log('add content', res, this.type)
          this.$router.push({ name: this.type, params: { id: res.id } })
        })
        // this.$database.add(this.type, obj, (res) => {
        //   // GA - Add content event
        //   this.$ga.event('content', 'add', this.type)
        //   this.showAddContent = false
        //   Notify.create({
        //     message: this.readableType + ' created!',
        //     type: 'positive',
        //     position: 'bottom-left'
        //   })
        //   console.log('add content', res, this.type)
        //   if (this.type === 'rseries') {
        //     this.$router.push({ name: this.type, params: { seriesid: res._id } })
        //   } else {
        //     this.$router.push({ name: this.type, params: { id: res._id } })
        //   }
        // })
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
