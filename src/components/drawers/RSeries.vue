<template>
  <div>
    <h5>Lesson Outline</h5>
    <ol>
      <li v-for="lesson in lessons" :key="lesson._id">{{ lesson.title }}</li>
    </ol>
    <h5>User Roles</h5>
    <ul>
      <li v-for="user in users" :key="user.id">{{ user.name }} -- {{ user.role }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  // name: 'ComponentName',
  firebase () {
    return {
      series: {
        source: this.$firebase.ref('rseries', '', this.$route.params.seriesid),
        asObject: true,
        readyCallback: function (val) {
          for (var user in this.series.roles) {
            this.$firebase.user(user).once('value').then((userInfo) => {
              console.log(userInfo.val())
              this.users.push({
                id: user,
                name: userInfo.val().name.first + ' ' + userInfo.val().name.last,
                role: this.series.roles[user]
              })
            })
          }
        }
      },
      lessons: {
        source: this.$firebase.lessonsRef(this.id).orderByChild('order')
      }
    }
  },
  data () {
    return {
      id: this.$route.params.seriesid,
      users: []
    }
  }
}
</script>

<style>
</style>
