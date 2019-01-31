const CONTENT = [ 'text', 'bible', 'activity', 'question' ]
const MEDIA = [ 'quote', 'video', 'image', 'illustration', 'composition' ]
const NQ_MEDIA = [ 'quote', 'outline', 'idea', 'illustration', 'book', 'movie', 'video', 'image', 'composition', 'article', 'document', 'note', 'discourse' ]

const ALL_TYPES = {
  CONTENT,
  MEDIA,
  NQ_MEDIA
}

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Vue.prototype.$types = ALL_TYPES
}

export { ALL_TYPES }
