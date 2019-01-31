const BCVParser = require('bible-passage-reference-parser/js/en_bcv_parser').bcv_parser
// const BCV = new BCVParser()

// import axios from 'axios'
import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/functions'

// axios.defaults.baseURL = 'https://database.unshiftingshadows.com/message'
// axios.defaults.headers.post['Content-Type'] = 'application/json'

function readable (ref) {
  const bcv = new BCVParser().parse(ref)
  // var text = bcv.osis().replace(/(\d+).(\d+)/g, '$1:$2')
  // console.log(text)
  // console.log('bcv', bcv)
  console.log('run readable')
  if (bcv.entities[0].passages[0].start.b === bcv.entities[0].passages[0].end.b) {
    if (bcv.entities[0].passages[0].start.c === bcv.entities[0].passages[0].end.c) {
      if (bcv.entities[0].passages[0].start.v === bcv.entities[0].passages[0].end.v) {
        return bcv.entities[0].passages[0].start.b + ' ' + bcv.entities[0].passages[0].start.c + ':' + bcv.entities[0].passages[0].start.v
      } else {
        return bcv.entities[0].passages[0].start.b + ' ' + bcv.entities[0].passages[0].start.c + ':' + bcv.entities[0].passages[0].start.v + '-' + bcv.entities[0].passages[0].end.v
      }
    } else {
      return bcv.entities[0].passages[0].start.b + ' ' + bcv.entities[0].passages[0].start.c + ':' + bcv.entities[0].passages[0].start.v + '-' + bcv.entities[0].passages[0].end.c + ':' + bcv.entities[0].passages[0].end.v
    }
  } else {
    console.error('Books dont match...')
  }
}

function osis (ref) {
  console.log('run parse osis')
  return new BCVParser().parse(ref).osis()
}

function text (ref, version) {
  return firebase.functions().httpsCallable('bible-bibleText')({ bibleRef: ref, version: version })
    .then((res) => {
      console.log(res)
      return fixQuotations(res.data.text)
    })
    .catch((err) => {
      console.error(err)
      return null
    })
  // firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function (idToken) {
  //   axios.post('/bible', {
  //     ref: ref,
  //     version: version,
  //     token: idToken
  //   })
  //     .then((res) => {
  //       console.log(res.data)
  //       return res.data
  //     })
  //     .catch((err) => {
  //       console.log(err)
  //       return null
  //     })
  // })
}

function fixQuotations (text) {
  console.log('text', text)
  let goodText = text.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/xx|[\u0060][\u0060]/g, '"').trim()
  console.log('goodText', goodText)
  if (goodText.charAt(0) === '"' || goodText.charAt(0) === "'") {
    return goodText.endsWith('"') || goodText.endsWith("'") ? goodText : goodText.concat(goodText.charAt(0) === '"' ? '"' : "'")
  } else if (goodText.endsWith('"') || goodText.endsWith("'")) {
    return goodText.endsWith('"') ? '"'.concat(goodText) : "'".concat(goodText)
  } else {
    return goodText
  }
}

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Vue.prototype.$bible = {
    bcv: new BCVParser(),
    readable: readable,
    parse: osis,
    text: text
  }
}
