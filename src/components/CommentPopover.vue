<template>
  <div>
    <q-btn icon="fas fa-comments" color="primary" size="lg" class="comment-btn" round>
      <q-popover :fit="$q.platform.is.mobile">
        <div class="comment-div">
          <span class="q-title">Comments</span>
          <p>Not yet implemented...</p>
        </div>
      </q-popover>
    </q-btn>
  </div>
</template>

<script>
export default {
  name: 'Comments',
  data () {
    return {}
  }
}
</script>

<style>

.comment-btn {
  position: fixed;
  right: 30px;
  bottom: 30px;
}

.comment-div {
  padding: 30px;
}

</style>
