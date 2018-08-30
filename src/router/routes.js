
export default [
  { path: '/', redirect: '/dashboard' },

  {
    path: '/',
    component: () => import('layouts/builder'),
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('pages/ODashboard') },
      { path: 'list/:type', name: 'olist', component: () => import('pages/OList') },
      { path: 'media/:type', name: 'omedia', component: () => import('pages/OMedia') },
      { path: 'series/:id', name: 'oseries', component: () => import('pages/OSeries') },
      { path: 'lesson/:id', name: 'olesson', component: () => import('pages/OLesson') },
      { path: 'sermon/:id', name: 'osermon', component: () => import('pages/OSermon') },
      { path: 'scratch/:id', name: 'oscratch', component: () => import('pages/OScratchPad') },
      { path: 'archive/:id', name: 'oarchive', component: () => import('pages/OArchive') },
      { path: 'settings', name: 'osettings', component: () => import('pages/Settings') },
      { path: 'support', name: 'osupport', component: () => import('pages/Support') }
    ],
    meta: {
      requiresAuth: true,
      requiresREAL: false
    }
  },

  {
    path: '/login',
    component: () => import('layouts/default'),
    children: [
      { path: '', name: 'login', component: () => import('pages/Login') }
    ]
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
