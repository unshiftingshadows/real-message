<template>
  <q-modal ref="modal" content-classes="slide-modal" maximized>
    <q-btn
      color="primary"
      @click.native="$refs.modal.hide()"
      icon="fas fa-times"
      class="float-right"
      size="sm"
    />
    To build a content slide...
  </q-modal>
</template>

<script>
export default {
  name: 'slide-content',
  props: ['data', 'id'],
  data () {
    return {}
  },
  methods: {
    open () {
      this.$refs.modal.show()
    },
    close () {
      this.$refs.modal.hide()
    }
  }
}
</script>

<style>
</style>
