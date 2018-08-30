import firebase from 'firebase'
require('firebase/firestore')
import VueFire from 'vuefire'
import VueFirestore from 'vue-firestore'

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
  // if (type === 'rdevo') {
  //   return devoContent(seriesid, lessonid, id).child(selection)
  // } else if (type === 'rguide') {
  //   return guides(seriesid, lessonid, id).child(selection)
  // } else if (type === 'rreview') {
  //   return review(seriesid, lessonid).child(selection)
  // } else {
  //   var cur = type.charAt(0)
  //   var media = type.slice(1)
  //   if (media !== 'series') {
  //     return fbapp.database().ref(cur + '/' + media + 's/' + id + '/' + selection)
  //   } else {
  //     return fbapp.database().ref(cur + '/' + media + '/' + id + '/' + selection)
  //   }
  // }
  if (type !== 'series') {
    return fbapp.database().ref('message/' + type + 's/' + id + '/' + selection)
  } else {
    return fbapp.database().ref('message/' + type + '/' + id + '/' + selection)
  }
}

// function lessons (seriesid) {
//   return fbapp.database().ref('builder/lessons/' + seriesid)
// }

// function devos (seriesid, lessonid) {
//   return fbapp.database().ref('builder/devos/' + seriesid + '/' + lessonid)
// }

// function devoContent (seriesid, lessonid, devoid) {
//   return fbapp.database().ref('builder/devoContent/' + seriesid + '/' + lessonid + '/' + devoid)
// }

// function guides (seriesid, lessonid, guideType) {
//   return fbapp.database().ref('builder/guides/' + seriesid + '/' + lessonid + '/' + guideType)
// }

// function review (seriesid, lessonid) {
//   return fbapp.database().ref('builder/review/' + seriesid + '/' + lessonid)
// }

function sectionModules (type, id, sectionid, seriesid, lessonid) {
  // if (type === 'rdevo') {
  //   return devoContent(seriesid, lessonid, id).child('sectionModules').child(sectionid)
  // } else if (type === 'rguide') {
  //   return guides(seriesid, lessonid, id).child('sectionModules').child(sectionid)
  // } else if (type === 'rreview') {
  //   return review(seriesid, lessonid).child('sectionModules').child(sectionid)
  // } else {
  //   var cur = type.charAt(0)
  //   var media = type.slice(1)
  //   if (media !== 'series') {
  //     return fbapp.database().ref(cur + '/' + media + 's/' + id + '/sectionModules/' + sectionid)
  //   } else {
  //     return fbapp.database().ref(cur + '/' + media + '/' + id + '/sectionModules/' + sectionid)
  //   }
  // }
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
  Vue.use(VueFire)
  Vue.use(VueFirestore)
  Vue.prototype.$firebase = {
    emailCred: firebase.auth.EmailAuthProvider.credential,
    auth: fbapp.auth(),
    db: fbapp.database(),
    store: firestore,
    ref: dbref,
    user: user,
    imagesRef: fbapp.storage().ref('images'),
    // lessonsRef: lessons,
    // devosRef: devos,
    // devoContentRef: devoContent,
    // guides: guides,
    // review: review,
    sectionModules: sectionModules
  }
}
