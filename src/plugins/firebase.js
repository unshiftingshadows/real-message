import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
// import VueFire from 'vuefire'
// import VueFirestore from 'vue-firestore'
import FieryVue from 'fiery-vue'

const fbapp = firebase.initializeApp({
  apiKey: 'AIzaSyCAsGVxjcBRsSNlQsymRnzWQAAYqphmmVU',
  authDomain: 'real-45953.firebaseapp.com',
  databaseURL: 'https://real-45953.firebaseio.com',
  projectId: 'real-45953',
  storageBucket: 'real-45953.appspot.com',
  messagingSenderId: '231971009763'
})

const firestore = fbapp.firestore()
const settings = {
  timestampsInSnapshots: true
}
firestore.settings(settings)

function dbref (type, selection, id, seriesid, lessonid) {
  console.log('run dbref')
  if (type !== 'series') {
    return fbapp.database().ref('message/' + type + 's/' + id + '/' + selection)
  } else {
    return fbapp.database().ref('message/' + type + '/' + id + '/' + selection)
  }
}

function sectionModules (type, id, sectionid, seriesid, lessonid) {
  if (type !== 'series') {
    return fbapp.database().ref('message/' + type + 's/' + id + '/sectionModules/' + sectionid)
  } else {
    return fbapp.database().ref('message/' + type + '/' + id + '/sectionModules/' + sectionid)
  }
}

function user (uid) {
  if (uid) {
    console.log('valid uid', uid)
    return fbapp.firestore().collection('users').doc(uid)
  } else {
    if (fbapp.auth().currentUser) {
      return fbapp.firestore().collection('users').doc(fbapp.auth().currentUser.uid)
    } else {
      return false
    }
  }
}

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  // Vue.use(VueFire)
  // Vue.use(VueFirestore)
  Vue.use(FieryVue)
  Vue.prototype.$firebase = {
    emailCred: firebase.auth.EmailAuthProvider.credential,
    auth: fbapp.auth(),
    db: fbapp.database(),
    store: firestore,
    ref: dbref,
    user: user,
    imagesRef: fbapp.storage().ref('images'),
    sectionModules: sectionModules
  }
}
