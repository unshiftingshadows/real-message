import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import 'firebase/firestore'
import 'firebase/storage'
import 'firebase/functions'
// import VueFire from 'vuefire'
// import VueFirestore from 'vue-firestore'
import FieryVue from 'fiery-vue'
const Fuse = require('fuse.js')

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

const nqSettings = {
  apiKey: 'AIzaSyBRyXtYfwhda49puaaFlC0yThP1bpELPgI',
  authDomain: 'notes-and-quotes-977a3.firebaseapp.com',
  databaseURL: 'https://notes-and-quotes-977a3.firebaseio.com',
  projectId: 'notes-and-quotes-977a3',
  storageBucket: 'notes-and-quotes-977a3.appspot.com',
  messagingSenderId: '333897842731'
}

const fbapp = firebase.initializeApp(process.env.DEV ? devSettings : prodSettings)
// Swap for production database when developing
// const fbapp = firebase.initializeApp(prodSettings)
const nqapp = firebase.initializeApp(nqSettings, 'nq')

const firestore = fbapp.firestore()
const settings = {
  timestampsInSnapshots: true
}
firestore.settings(settings)

const functions = fbapp.functions()

const nqFirestore = nqapp.firestore()
nqFirestore.settings(settings)

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

async function customNQLogin (uid) {
  var loginFunction = functions.httpsCallable('nq-login')
  const loginToken = await loginFunction({ uid })
  try {
    await nqapp.auth().signInWithCustomToken(loginToken)
    console.log('logged with token', nqapp.auth().currentUser)
    return true
  } catch (error) {
    return false
  }
}

let mediaIndex = []
let mediaIndexTime = null
let snippetIndex = []
let snippetIndexTime = null

function setMediaIndex () {
  console.log('setMediaIndex')
  mediaIndexTime = new Date()
  return nqapp.database().ref('searchIndex').once('value').then((snapshot) => {
    const data = snapshot.val()
    mediaIndex = [].concat.apply([], Object.keys(data).map(type => {
      return Object.keys(data[type]).map(e => { return { ...data[type][e], type: type, '.key': e } })
    }))
    return true
  })
}

function setSnippetIndex () {
  console.log('setSnippetIndex')
  snippetIndexTime = new Date()
  return nqapp.database().ref('searchIndexSnippet').once('value').then((snapshot) => {
    const data = snapshot.val()
    snippetIndex = [].concat.apply([], Object.keys(data).map(type => {
      return Object.keys(data[type]).map(e => { return { ...data[type][e], type: type, '.key': e } })
    }))
    return true
  })
}

async function nqSearch (searchInput, done) {
  if (mediaIndexTime === null || new Date().getTime() - mediaIndexTime.getTime() > 900000) {
    await setMediaIndex()
    console.log('mediaIndex', mediaIndex)
  }
  // console.log('search')
  // if (searchInput.split(':')[0] === 'tag') {
  //   done([
  //     {
  //       label: searchInput.split(':')[1].split(',').join('&'),
  //       sublabel: 'tag',
  //       type: 'tag'
  //     }
  //   ])
  // } else {
  var mediaOptions = {
    threshold: 0.2,
    tokenize: true,
    includeScore: true,
    keys: [{
      name: 'title',
      weight: 0.3
    }, {
      name: 'author',
      weight: 0.3
    }, {
      name: 'tags',
      weight: 0.4
    }]
  }
  var fuse = new Fuse(mediaIndex, mediaOptions)
  var results = fuse.search(searchInput)
  results.forEach(function (res) {
    res.id = res.item['.key']
    res.label = res.item.title
    res.sublabel = res.item.type
  })
  // done(results)
  // }
  if (snippetIndexTime === null || new Date().getTime() - snippetIndexTime.getTime() > 900000) {
    await setSnippetIndex()
    console.log('snippetIndex', snippetIndex)
  }
  // console.log('search')
  // if (searchInput.split(':')[0] === 'tag') {
  //   done([
  //     {
  //       label: searchInput.split(':')[1].split(',').join('&'),
  //       sublabel: 'tag',
  //       type: 'tag'
  //     }
  //   ])
  // } else {
  var snippetOptions = {
    threshold: 0.2,
    tokenize: true,
    includeScore: true,
    keys: [{
      name: 'text',
      weight: 0.5
    }, {
      name: 'author',
      weight: 0.2
    }, {
      name: 'tags',
      weight: 0.3
    }]
  }
  var snippetFuse = new Fuse(snippetIndex, snippetOptions)
  var snippetResults = snippetFuse.search(searchInput)
  snippetResults.forEach(function (result) {
    result.id = result.item['.key']
    result.label = result.item.text
    result.sublabel = `${result.item.title} | ${result.item.author}`
  })
  //   done(snippetResults)
  // }
  var finalResults = results.concat(snippetResults).sort((a, b) => { return a.score - b.score })
  console.log('results', finalResults)
  done(finalResults)
}

function nqMedia (type, id) {
  return nqFirestore.collection(type + 's').doc(id)
}

// async function nqSearch (searchTerms, searchTypes) {
//   // const searchFunction = nqapp.functions().httpsCallable('search-all')
//   // return searchFunction({ searchTerms, searchTypes })
//   const searchOptions = {
//     threshold: 0.2,
//     tokenize: true,
//     keys: [{
//       name: 'media.tags',
//       weight: 0.3
//     }, {
//       name: 'media.text',
//       weight: 0.4
//     }, {
//       name: 'media.title',
//       weight: 0.2
//     }, {
//       name: 'media.author',
//       weight: 0.1
//     }]
//   }

//   const allMedia = [].concat.apply([], (await Promise.all(searchTypes.map(e => { return nqFirestore.collection(e + 's').get() }))).map((e, index) => {
//     return e.docs.map(f => {
//       return { media: f.data(), id: f.id, type: searchTypes[index] }
//     })
//   }))

//   console.log('totalitems', allMedia)

//   // Search through returned arrays
//   const fuse = new Fuse(allMedia, searchOptions)

//   // Return summed array
//   return { searchTerms, searchTypes, results: fuse.search(searchTerms).slice(0, 10) }
// }

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
    imagesRef: fbapp.storage().ref('images'),
    // modules: modules,
    // sections: sections
    nqAuth: nqapp.auth(),
    nqLogin: customNQLogin,
    nqSearch: nqSearch,
    nqMedia: nqMedia
  }
}
