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
const BCVParser = require('bible-passage-reference-parser/js/en_bcv_parser').bcv_parser

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
// const settings = {
//   timestampsInSnapshots: true
// }
// firestore.settings(settings)

const db = fbapp.database()

const functions = fbapp.functions()

const nqFirestore = nqapp.firestore()
// nqFirestore.settings(settings)

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
  try {
    const loginToken = (await loginFunction({ uid })).data
    if (loginToken.status) {
      try {
        await nqapp.auth().signInWithCustomToken(loginToken.token)
        console.log('nq logged with token', nqapp.auth().currentUser)
        return true
      } catch (error) {
        console.log('nqlogin error', error)
        return false
      }
    } else {
      console.log('nqlogin unsuccessful...', loginToken)
      return false
    }
  } catch (error) {
    console.error('nqLogin function errored...', error)
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

function checkIndex () {
  const prom = []

  if (mediaIndexTime === null || new Date().getTime() - mediaIndexTime.getTime() > 900000) {
    prom.push(setMediaIndex())
    console.log('mediaIndex', mediaIndex)
  }

  if (snippetIndexTime === null || new Date().getTime() - snippetIndexTime.getTime() > 900000) {
    prom.push(setSnippetIndex())
    console.log('snippetIndex', snippetIndex)
  }

  return Promise.all(prom)
}

async function nqSearch (searchInput, done) {
  await checkIndex()
  // if (mediaIndexTime === null || new Date().getTime() - mediaIndexTime.getTime() > 900000) {
  //   await setMediaIndex()
  //   console.log('mediaIndex', mediaIndex)
  // }
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
    res.type = res.item.type
  })
  // done(results)
  // }
  // if (snippetIndexTime === null || new Date().getTime() - snippetIndexTime.getTime() > 900000) {
  //   await setSnippetIndex()
  //   console.log('snippetIndex', snippetIndex)
  // }
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
    result.type = result.item.type
  })
  //   done(snippetResults)
  // }
  var finalResults = results.concat(snippetResults).sort((a, b) => { return a.score - b.score })
  console.log('results', finalResults)
  done(finalResults)
}

function checkBible (searchVal, ref) {
  const searchBook = searchVal.entities[0].passages[0].start.b
  const searchChap = [searchVal.entities[0].passages[0].start.c, searchVal.entities[0].passages[0].end.c]
  const searchVers = [searchVal.entities[0].passages[0].start.v, searchVal.entities[0].passages[0].end.v]
  const refBook = ref.entities[0].passages[0].start.b
  const refChap = [ref.entities[0].passages[0].start.c, ref.entities[0].passages[0].end.c]
  const refVers = [ref.entities[0].passages[0].start.v, ref.entities[0].passages[0].end.v]
  if (searchBook === refBook) {
    if ((searchChap[0] <= refChap[0] && searchChap[1] >= refChap[0]) || (searchChap[0] <= refChap[1] && searchChap[1] >= refChap[1])) {
      if ((searchVers[0] <= refVers[0] && searchVers[1] >= refVers[0]) || (searchVers[0] <= refVers[1] && searchVers[1] >= refVers[1])) {
        return true
      }
    }
  }
  return false
}

async function nqBibleSearch (term, done) {
  await checkIndex()
  const searchVal = new BCVParser().parse(term)
  console.log('searchVal', searchVal)
  // console.log('mediaIndex', mediaIndex)
  if (searchVal.entities.length === 1) {
    var mediaResults = mediaIndex.filter(e => {
      return e.bibleRefs ? e.bibleRefs.split(',').map(f => { return checkBible(searchVal, new BCVParser().parse(f)) }).reduce((sum, next) => { return sum || next }, false) : false
    }).map(e => {
      return {
        ...e,
        id: e['.key'],
        label: e.title,
        sublabel: e.type
      }
    })
    var snippetResults = snippetIndex.filter(e => {
      return e.bibleRefs ? e.bibleRefs.split(',').map(f => { return checkBible(searchVal, new BCVParser().parse(f)) }).reduce((sum, next) => { return sum || next }, false) : false
    }).map(e => {
      return {
        ...e,
        id: e['.key'],
        label: e.text,
        sublabel: `${e.title} | ${e.author}`
      }
    })
    console.log('mediaResults', mediaResults)
    console.log('snippetResults', snippetResults)
    done(mediaResults.concat(snippetResults))
  } else {
    console.log('bible search failed...')
    done([])
  }
}

function nqMedia (type, id) {
  return nqFirestore.collection(type + 's').doc(id)
}

function addDocUser (type, id, emails) {
  const addUserFunction = functions.httpsCallable('message-shareDoc')
  return addUserFunction({
    docType: type,
    docid: id,
    emails
  }).catch(err => {
    console.error('addDocUser error', err)
  })
}

function getDisplayName (uid) {
  const getDisplayNameFunction = functions.httpsCallable('user-getDisplayName')
  return getDisplayNameFunction({
    uid
  }).catch(err => {
    console.error('getDisplayname error', err)
  })
}

// function logStackdriver (level, args) {
//   const labels = { version: '0.0.42', session: '' }
//   const stackdriverFunction = functions.httpsCallable('applogs-message')
//   return stackdriverFunction({ level, args, labels }).then(e => console.log('log', e)).catch(err => console.error('stackdriver log', err))
// }

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

var index = {}
var fullIndex = []

function setIndex () {
  console.log('setindex', `index/${fbapp.auth().currentUser.uid}`)
  return db.ref(`index/${fbapp.auth().currentUser.uid}`).on('value', (snap) => {
    var data = snap.val()
    Object.keys(data).map((key) => { index[key] = Object.keys(data[key]).map(f => { return { id: f, type: key, ...data[key][f] } }) })
    // console.log('index pulled', index)
    fullIndex = [].concat.apply([], ...Object.values(index))
  })
}

async function getIndex (type) {
  if (index !== {}) {
    if (type) {
      await index[type]
      return index[type]
    } else {
      await fullIndex
      return fullIndex
    }
  } else {
    await setIndex()
    // index = new Promise((resolve, reject) => {
    //   db.ref(`index/${fbapp.auth().currentUser.uid}`).on('value', (snap) => {
    //     resolve(snap.val().map((e, key) => { return Object.keys(e).map(f => { return { id: f, type: key, ...e[f] } }) }))
    //   })
    // })
    fullIndex = [].concat.apply([], ...index)
    return getIndex(type)
  }
}

async function search (terms, type, done) {
  console.log('search function', terms, type)
  var searchOptions = {
    threshold: 0.2,
    // tokenize: true,
    // includeScore: true,
    keys: [{
      name: 'title',
      weight: 0.3
    }, {
      name: 'tags',
      weight: 0.3
    }, {
      name: 'bibleRefs',
      weight: 0.4
    }]
  }
  var tmpIndex = await getIndex(type)
  console.log('tmpIndex', tmpIndex)
  var fuse = new Fuse(tmpIndex, searchOptions)
  var results = fuse.search(terms)
  console.log('initresults firebase', results)
  results.forEach(function (res) {
    // res.id = res.item['.key']
    res.label = res.title
    res.sublabel = res.type
    res.type = res.type
  })

  if (done) {
    done(results)
  } else {
    // console.log('results', results, index, fullIndex)
    return results
  }
}

// var lists = {}

// function getList(type) {

// }

export default ({ app, router, Vue }) => {
  Vue.use(FieryVue)
  Vue.prototype.$firebase = {
    base: fbapp.firebase_,
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
    nqAuth: nqapp.auth(),
    nqLogin: customNQLogin,
    nqSearch: nqSearch,
    nqBibleSearch: nqBibleSearch,
    nqMedia: nqMedia,
    addDocUser: addDocUser,
    getDisplayName,
    setIndex,
    getIndex,
    search
    // log: function (log, docid, type) {
    //   console.log('route', router.history.current)
    //   firestore.collection('log').add({
    //     ...log,
    //     uid: fbapp.auth().currentUser.uid,
    //     email: fbapp.auth().currentUser.email,
    //     datestamp: new Date(),
    //     route: {
    //       fullPath: router.history.current.fullPath,
    //       hash: router.history.current.hash,
    //       meta: router.history.current.meta,
    //       name: router.history.current.name,
    //       params: router.history.current.params,
    //       path: router.history.current.path,
    //       query: router.history.current.query
    //     },
    //     app: 'message'
    //   })
    //   firestore.collection('user').doc(fbapp.auth().currentUser.uid).collection('log').add({
    //     ...log,
    //     datestamp: new Date()
    //   })
    //   if (docid) {
    //     firestore.collection(`message${type.charAt(0).toUpperCase()}${type.slice(1)}`).doc(docid).collection('log').add({
    //       ...log,
    //       uid: fbapp.auth().currentUser.uid,
    //       email: fbapp.auth().currentUser.email,
    //       username: fbapp.auth().currentUser.displayName,
    //       datestamp: new Date()
    //     })
    //   }
    // }
  }
  Vue.prototype.$log = {
    info () {
      console.log(...arguments)
      // logStackdriver('info', Array.prototype.slice.call(arguments).map(e => JSON.stringify(e)))
    },
    warn () {
      console.warn(...arguments)
      // logStackdriver('warn', Array.prototype.slice.call(arguments).map(e => JSON.stringify(e)))
    },
    error () {
      console.error(...arguments)
      // logStackdriver('error', Array.prototype.slice.call(arguments).map(e => JSON.stringify(e)))
    }
  }
}
