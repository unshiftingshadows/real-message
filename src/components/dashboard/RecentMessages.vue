<template>
  <q-card class="dashboard-card">
    <q-card-title>Recent Messages</q-card-title>
    <q-card-separator />
    <q-card-main>
      <q-list link no-border>
        <q-item v-for="message in solidMessages" :key="message.id" @click.native="$router.push({ name: 'message', params: { id: message.id } })">
          <q-item-main :label="message.title"></q-item-main>
          <q-item-side>{{ formatDate(message.modifiedDate) }}</q-item-side>
        </q-item>
      </q-list>
    </q-card-main>
  </q-card>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'DashboardRecentMessages',
  fiery: true,
  props: ['limit'],
  data () {
    return {
      messages: this.$fiery(this.$firebase.list('message'), {
        query: messages => messages.where('users', 'array-contains', this.$firebase.auth.currentUser.uid).where('archived', '==', false).orderBy('modifiedDate', 'desc').limit(this.limit),
        key: 'id',
        exclude: ['id'],
        onSuccess: (list) => {
        }
      })
    }
  },
  computed: {
    solidMessages () {
      return this.messages.filter(e => { return e !== undefined })
    }
  },
  methods: {
    formatDate (val) {
      return date.formatDate(val.toDate(), 'YYYY-MM-DD')
    }
  }
}
</script>

<style>
</style>
