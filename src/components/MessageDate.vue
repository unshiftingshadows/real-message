<template>
  <q-modal ref="modal" content-classes="message-date-modal">
    <div class="row gutter-md">
      <div class="col-12">
        <q-btn
          color="primary"
          @click.native="hide()"
          icon="fas fa-times"
          class="float-right"
          size="sm"
        />
        <h4>Dates</h4>
      </div>
      <div class="col-12">
        <q-list>
          <q-item v-for="(item, index) in dates" :key="index">
            <q-item-main>{{ readableDate(item.date) }} - {{ item.audience }}</q-item-main>
            <q-item-side icon="fas fa-times" right color="negative" class="cursor-pointer" @click.native="remove(item)" />
          </q-item>
        </q-list>
        <q-datetime v-model="newDate" type="date" float-label="New Date" @keyup.enter="add()" dark />
        <q-input v-model="newAudience" type="text" float-label="New Audience" @keyup.enter="add()" />
      </div>
      <div class="col-12">
        <q-btn color="primary" @click.native="add()">Add</q-btn>
      </div>
    </div>
  </q-modal>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'MessageDate',
  props: ['dates'],
  data () {
    return {
      newDate: '',
      newAudience: ''
    }
  },
  methods: {
    show () {
      this.$refs.modal.show()
    },
    hide () {
      this.$refs.modal.hide()
    },
    add () {
      console.log('add date...', this.newDate)
      this.$firebase.ref('message', '', this.$route.params.id).update({
        dates: this.$firebase.base.firestore.FieldValue.arrayUnion({ date: new Date(this.newDate), audience: this.newAudience })
      })
      this.newDate = ''
      this.newAudience = ''
    },
    remove (item) {
      this.$firebase.ref('message', '', this.$route.params.id).update({
        dates: this.$firebase.base.firestore.FieldValue.arrayRemove(item)
      })
    },
    readableDate (stamp) {
      console.log('stamp', stamp)
      return date.formatDate(stamp.toDate(), 'YYYY-MM-DD')
    }
  }
}
</script>

<style>

.message-date-modal {
  padding: 30px;
  width: 100%;
}

@media screen and (min-width: 1200px) {
  .message-date-modal {
    min-width: 500px;
    width: 500px;
  }
}

</style>
