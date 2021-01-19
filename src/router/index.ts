import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Data from '../views/DataSpreadSheet.vue'
import Home from '../views/Home.vue'
const routes: Array<RouteRecordRaw> = [
  {
    path: '/data-spreadsheet',
    name: 'DataSpreadSheet',
    component: Data
  },
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/volcano',
    name: 'Volcanoes',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/Volcanoes.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
