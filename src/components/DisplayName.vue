<template>
  <span><q-spinner-dots v-if="name === ''" /><span v-if="name !== ''">{{ name }}</span></span>
</template>

<script>
export default {
  name: 'DisplayName',
  props: ['uid'],
  data () {
    return {
      name: ''
    }
  },
  async created () {
    this.name = (await this.$firebase.getDisplayName(this.uid)).data
  }
}
</script>

<style>
</style>
