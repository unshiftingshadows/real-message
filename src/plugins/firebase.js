import firebase from 'firebase'
require('firebase/firestore')
import VueFire from 'vuefire'
import VueFirestore from 'vue-firestore'

const fbapp = firebase.initializeApp({
  apiKey: 'AIzaSyDq2zYerR8CLzwMZxUTa-3VG2o0RDLDHjo',
  authDomain: 'real-curriculum-builder.firebaseapp.com',
  databaseURL: 'https://real-curriculum-builder.firebaseio.com',
  projectId: 'real-curriculum-builder',
  storageBucket: 'real-curriculum-builder.appspot.com',
  messagingSenderId: '644396278678'
})

function dbref (type, selection, id, seriesid, lessonid) {
  console.log('run dbref')
  if (type === 'rdevo') {
    return devoContent(seriesid, lessonid, id).child(selection)
  } else if (type === 'rguide') {
    return guides(seriesid, lessonid, id).child(selection)
  } else if (type === 'rreview') {
    return review(seriesid, lessonid).child(selection)
  } else {
    var cur = type.charAt(0)
    var media = type.slice(1)
    if (media !== 'series') {
      return fbapp.database().ref(cur + '/' + media + 's/' + id + '/' + selection)
    } else {
      return fbapp.database().ref(cur + '/' + media + '/' + id + '/' + selection)
    }
  }
}

function lessons (seriesid) {
  return fbapp.database().ref('r/lessons/' + seriesid)
}

function devos (seriesid, lessonid) {
  return fbapp.database().ref('r/devos/' + seriesid + '/' + lessonid)
}

function devoContent (seriesid, lessonid, devoid) {
  return fbapp.database().ref('r/devoContent/' + seriesid + '/' + lessonid + '/' + devoid)
}

function guides (seriesid, lessonid, guideType) {
  return fbapp.database().ref('r/guides/' + seriesid + '/' + lessonid + '/' + guideType)
}

function review (seriesid, lessonid) {
  return fbapp.database().ref('r/review/' + seriesid + '/' + lessonid)
}

function sectionModules (type, id, sectionid, seriesid, lessonid) {
  if (type === 'rdevo') {
    return devoContent(seriesid, lessonid, id).child('sectionModules').child(sectionid)
  } else if (type === 'rguide') {
    return guides(seriesid, lessonid, id).child('sectionModules').child(sectionid)
  } else if (type === 'rreview') {
    return review(seriesid, lessonid).child('sectionModules').child(sectionid)
  } else {
    var cur = type.charAt(0)
    var media = type.slice(1)
    if (media !== 'series') {
      return fbapp.database().ref(cur + '/' + media + 's/' + id + '/sectionModules/' + sectionid)
    } else {
      return fbapp.database().ref(cur + '/' + media + '/' + id + '/sectionModules/' + sectionid)
    }
  }
}

function user (uid) {
  if (uid) {
    console.log('valid uid', uid)
    return fbapp.database().ref('/users/' + uid)
  } else {
    if (fbapp.auth().currentUser) {
      return fbapp.database().ref('/users/' + fbapp.auth().currentUser.uid)
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
    ref: dbref,
    user: user,
    imagesRef: fbapp.storage().ref('images'),
    lessonsRef: lessons,
    devosRef: devos,
    devoContentRef: devoContent,
    guides: guides,
    review: review,
    sectionModules: sectionModules
  }
}
