<template>
  <q-page padding v-if="$root.user.email === 'jacobeck09@gmail.com'">
    <div class="row gutter-md">
      <div class="col-12">
        <h2>Add Users</h2>
      </div>
      <div class="col-12">
        <q-input v-model="email" float-label="Email" />
      </div>
      <div class="col-6">
        <q-input v-model="first" float-label="First" />
      </div>
      <div class="col-6">
        <q-input v-model="last" float-label="Last" />
      </div>
      <div class="col-12">
        <q-btn color="primary" @click.native="addUser">Add</q-btn>
      </div>
    </div>
  </q-page>
</template>

<script>
import { Notify } from 'quasar'

export default {
  // name: 'PageName',
  data () {
    return {
      email: '',
      first: '',
      last: '',
      group: 'ind'
    }
  },
  methods: {
    addUser () {
      this.$database.addUser(this.email, this.first, this.last, this.group, (newRef) => {
        console.log('added!')
        this.email = ''
        this.first = ''
        this.last = ''
        Notify.create({
          type: 'positive',
          message: 'New user added!',
          position: 'bottom-left'
        })
      })
    }
  }
}
</script>

<style>
</style>
