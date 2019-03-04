const CONTENT = [ 'text', 'bible', 'activity', 'question', 'mainidea', 'bullet' ]
const MEDIA = [ 'quote', 'video', 'image', 'illustration', 'lyric' ]
const NQ_MEDIA = [ 'quote', 'outline', 'idea', 'illustration', 'book', 'movie', 'video', 'image', 'composition', 'article', 'document', 'note', 'discourse' ]
const DASHBOARD = [ 'donate', 'recentMessages', 'randomMedia', 'hymn', 'votd', 'potd', 'qotd', 'news' ]
const DASH_COMP = {
  donate: 'donate',
  recentMessages: 'recent-messages',
  randomMedia: 'random-media',
  news: 'recent-news',
  potd: 'potd',
  qotd: 'qotd',
  votd: 'votd',
  hymn: 'random-hymn'
}

const ALL_TYPES = {
  CONTENT,
  MEDIA,
  NQ_MEDIA,
  DASHBOARD,
  DASH_COMP
}

// leave the export, even if you don't use it
export default ({ app, router, Vue }) => {
  Vue.prototype.$types = ALL_TYPES
}

export { ALL_TYPES }
