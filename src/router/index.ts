import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/Home.vue')
    },
    {
      path: '/score-editor',
      name: 'scoreEditor',
      component: () => import('../views/ScoreEditor.vue')
    }
  ]
})

export default router 