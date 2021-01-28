import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Data from '../views/DataSpreadSheet.vue'
import Home from '../views/Home.vue'
import DataExplore from '../views/DataExplore.vue'

import { createApp } from 'vue'
const app1 = createApp(DataExplore);
const app2 = createApp(DataExplore);


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
    path: '/data-explore',
    name: 'DataExplore',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/DataExplore.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
