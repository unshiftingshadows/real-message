
export default [
  { path: '/', redirect: '/dashboard' },

  {
    path: '/',
    component: () => import('layouts/message'),
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('pages/Dashboard') },
      { path: 'list/:type', name: 'list', component: () => import('pages/ListContent') },
      { path: 'media/:type', name: 'media', component: () => import('pages/ListMedia') },
      { path: 'series/:id', name: 'series', component: () => import('pages/Series') },
      { path: 'message/:id', name: 'message', component: () => import('pages/Message') },
      { path: 'scratch/:id', name: 'scratch', component: () => import('pages/ScratchPad') },
      { path: 'archive/:id', name: 'archive', component: () => import('pages/Archive') },
      { path: 'settings', name: 'settings', component: () => import('pages/Settings') },
      { path: 'support', name: 'support', component: () => import('pages/Support') }
    ],
    meta: {
      requiresAuth: true
    }
  },

  {
    path: '/login',
    component: () => import('layouts/default'),
    children: [
      { path: '', name: 'login', component: () => import('pages/Login') }
    ]
  },

  {
    path: '/login2',
    component: () => import('layouts/default'),
    children: [
      { path: '', name: 'login2', component: () => import('pages/Login2') }
    ]
  },

  { // Always leave this as last one
    path: '*',
    component: () => import('pages/404')
  }
]
