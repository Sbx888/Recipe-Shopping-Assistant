import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Recipe from '../views/Recipe.vue'
import Dashboard from '../views/Dashboard.vue'
import Storage from '../views/Storage.vue'
import AddStorage from '../views/AddStorage.vue'
import StorageDetail from '../views/StorageDetail.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/storage',
      name: 'storage',
      component: Storage,
      meta: { requiresAuth: true }
    },
    {
      path: '/storage/add',
      name: 'add-storage',
      component: AddStorage,
      meta: { requiresAuth: true }
    },
    {
      path: '/storage/:id',
      name: 'storage-detail',
      component: StorageDetail,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('token')
    if (!token) {
      next('/login')
      return
    }
  }
  next()
})

export default router 