<template>
  <q-card class="dashboard-card">
    <q-card-title>Random {{ type.charAt(0).toUpperCase() + type.slice(1) }}</q-card-title>
    <q-card-separator />
    <q-card-main v-if="document.length > 0 && type !== 'video' && type !== 'image'">
      <div v-if="type === 'quote'">
        <p>{{ document[0].text }}</p>
        <p class="text-faded text-right" v-if="document[0].author !== '' || document[0].title !== ''">{{ document[0].author }}<span v-if="document[0].author !== '' && document[0].title !== ''"> | </span><em>{{ document[0].title }}</em></p>
      </div>
      <div v-if="type === 'lyric' || type === 'illustration'">
        <p>{{ document[0].title }}</p>
        <p class="text-faded">{{ document[0].text }}</p>
      </div>
    </q-card-main>
    <q-card-media v-if="document.length > 0 && (type === 'video' || type ==='image')">
      <img :src="document[0].imageURL" v-if="type === 'image'" />
      <q-video :src="document[0].embedURL" v-if="type === 'video'" />
    </q-card-media>
  </q-card>
</template>

<script>
export default {
  name: 'DashboardRandomMedia',
  fiery: true,
  props: ['type'],
  data () {
    return {
      order: false,
      document: this.$fiery(this.$firebase.list(this.type), {
        query: doc => doc.where('user', '==', this.$firebase.auth.currentUser.uid).where(this.$firebase.base.firestore.FieldPath.documentId(), '>=', this.$firebase.list(this.type).doc()),
        key: 'id',
        exclude: ['id'],
        onSuccess: (final) => {
          if (final.length === 0) {
            this.refresh()
          }
        }
      })
    }
  },
  methods: {
    refresh () {
      this.order = !this.order
      this.document = this.$fiery(this.$firebase.list(this.type), {
        query: doc => doc.where('user', '==', this.$firebase.auth.currentUser.uid).where(this.$firebase.base.firestore.FieldPath.documentId(), this.order ? '>=' : '<=', this.$firebase.list(this.type).doc()),
        key: 'id',
        exclude: ['id'],
        onSuccess: (final) => {
          if (final.length === 0) {
            // this.refresh()
          }
        }
      })
    }
  }
}
</script>

<style>
</style>
