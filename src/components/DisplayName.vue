<template>
  <span>{{ name }}</span>
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
