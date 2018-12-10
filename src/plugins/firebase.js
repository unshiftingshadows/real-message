import firebase from 'firebase/app'
import 'firebase/auth'
// import 'firebase/database'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/functions'
// import VueFire from 'vuefire'
// import VueFirestore from 'vue-firestore'
import FieryVue from 'fiery-vue'

const devSettings = {
  apiKey: 'AIzaSyAjXGlux1zLL4QfEi4an2-KkIT4F6HxtMc',
  authDomain: 'real-dev-7b60c.firebaseapp.com',
  databaseURL: 'https://real-dev-7b60c.firebaseio.com',
  projectId: 'real-dev-7b60c',
  storageBucket: 'real-dev-7b60c.appspot.com',
  messagingSenderId: '945338183181'
}

const prodSettings = {
  apiKey: 'AIzaSyCAsGVxjcBRsSNlQsymRnzWQAAYqphmmVU',
  authDomain: 'real-45953.firebaseapp.com',
  databaseURL: 'https://real-45953.firebaseio.com',
  projectId: 'real-45953',
  storageBucket: 'real-45953.appspot.com',
  messagingSenderId: '231971009763'
}

const fbapp = firebase.initializeApp(process.env.DEV ? devSettings : prodSettings)
// Swap for production database when developing
// const fbapp = firebase.initializeApp(prodSettings)

const firestore = fbapp.firestore()
const settings = {
  timestampsInSnapshots: true
}
firestore.settings(settings)

function dbref (type, selection, id) {
  console.log('run dbref')
  if (selection !== '') {
    console.log('ref collection')
    return firestore.collection(`message${type.charAt(0).toUpperCase()}${type.substr(1)}/${id}/${selection}`)
  } else {
    return firestore.doc(`message${type.charAt(0).toUpperCase()}${type.substr(1)}/${id}`)
  }
}

function listRef (type) {
  console.log('list', `message${type.charAt(0).toUpperCase()}${type.substr(1)}`)
  return firestore.collection(`message${type.charAt(0).toUpperCase()}${type.substr(1)}`)
}

function user (uid) {
  if (uid) {
    console.log('valid uid', uid)
    return fbapp.firestore().collection('user').doc(uid)
  } else {
    if (fbapp.auth().currentUser) {
      return fbapp.firestore().collection('user').doc(fbapp.auth().currentUser.uid)
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
    // db: fbapp.database(),
    store: firestore,
    functions: fbapp.functions(),
    searchMedia: fbapp.functions().httpsCallable('message-searchMedia'),
    ref: dbref,
    list: listRef,
    user: user,
    imagesRef: fbapp.storage().ref('images')
    // modules: modules,
    // sections: sections
  }
}
