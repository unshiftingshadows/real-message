<template>
  <div>
    <q-btn icon="fas fa-comments" color="primary" size="lg" class="comment-btn" round @click="init()" />
    <div>
      <q-popover v-model="showing" ref="popover" class="comment-popover" :fit="$q.platform.is.mobile" @show="$refs.textinput.focus()">
        <div style="margin-bottom: 15px;">
          <span class="q-title">Comments</span>
          <q-spinner v-if="loading" size="1.5rem" class="on-right" color="primary" />
        </div>
        <div class="comment-div" v-if="!loading">
          <span v-if="comments.length < 1">No comments...</span>
          <div v-for="comment in cleanComments" :key="comment.id">
            <display-name class="q-caption" v-if="comment.uid !== $firebase.auth.currentUser.uid" :uid="comment.uid" />
            <q-chat-message
              :text="comment.text"
              :stamp="comment.date"
              :sent="comment.uid === $firebase.auth.currentUser.uid"
              text-color="white"
              :bg-color="comment.uid === $firebase.auth.currentUser.uid ? 'primary' : 'secondary'"
              size="8"
            />
          </div>
        </div>
        <!-- <q-scroll-area style="width: 100%; height: 50vh; max-height: 50vh;" v-if="!loading">
          <span v-if="comments.length < 1">No comments...</span>
          <q-chat-message
            v-for="comment in cleanComments"
            :key="comment.id"
            :text="comment.text"
            :stamp="readableDate(comment.timestamp)"
            :sent="comment.uid === $firebase.auth.currentUser.uid"
            text-color="white"
            :bg-color="comment.uid === $firebase.auth.currentUser.uid ? 'primary' : 'secondary'"
          />
        </q-scroll-area> -->
        <hr/>
        <q-input
          v-model="newComment"
          ref="textinput"
          type="text"
          @keyup.enter="addComment()"
          placeholder="Comment..."
          :after="[
            {
              icon: 'fas fa-angle-right',
              content: true,
              handler () {
                addComment()
              }
            }
          ]"
        />
      </q-popover>
    </div>
  </div>
</template>

<script>
import { date } from 'quasar'
import DisplayName from 'components/DisplayName'

export default {
  components: {
    DisplayName
  },
  name: 'Comments',
  fiery: true,
  data () {
    return {
      showing: false,
      loading: true,
      comments: [],
      newComment: ''
    }
  },
  computed: {
    cleanComments: function () {
      var merged = []
      this.comments.forEach((comment, index) => {
        if (merged.length > 0 && date.getDateDiff(merged[merged.length - 1].timestamp.toDate(), comment.timestamp.toDate(), 'minutes') === 0) {
          merged[merged.length - 1].text.push(comment.message)
        } else {
          merged.push({
            ...comment,
            text: [comment.message],
            date: date.formatDate(new Date(comment.timestamp.seconds * 1000), 'YYYY-MM-DD h:mm a')
          })
        }
      })
      return merged
    }
  },
  methods: {
    init () {
      this.newComment = ''
      if (this.loading) {
        this.comments = this.$fiery(this.$firebase.ref('message', 'comments', this.$route.params.id), {
          query: comments => comments.orderBy('timestamp'),
          key: 'id',
          exclude: ['id', 'name'],
          onSuccess: () => {
            this.loading = false
            this.$refs.popover.show()
          }
        })
      } else {
        this.$refs.popover.toggle()
      }
    },
    addComment () {
      this.$refs.popover.toggle()
      console.log('add', this.newComment)
      this.$fiery.create(this.comments, {
        message: this.newComment,
        uid: this.$firebase.auth.currentUser.uid,
        timestamp: new Date()
      })
      this.newComment = ''
      this.$refs.textinput.focus()
    }
  }
}
</script>

<style>

.comment-btn {
  position: absolute;
  right: 30px;
  bottom: 30px;
}

.comment-popover {
  position: absolute;
  top: auto !important;
  left: auto !important;
  right: 30px;
  bottom: 100px;
  min-width: 25vh;
  padding: 30px;
}

@media screen and (min-width: 1200px) {
  .comment-popover {
    width: 500px;
  }
}

.comment-div {
  max-height: 50vh;
  overflow-y: auto;
  overflow-x: visible;
}

</style>
