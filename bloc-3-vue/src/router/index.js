import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '@/stores/auth'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/recettes',
      name: 'recettes',
      component: () => import('../views/RecipesView.vue'),
    },
    {
      path: '/recettes/:id',
      name: 'recette-detail',
      component: () => import('../views/RecetteDetail.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/connexion',
      name: 'connexion',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/inscription',
      name: 'inscription',
      component: () => import('../views/RegisterView.vue'),
    },
    {
      path: '/recettes',
      name: 'recettes',
      component: () => import('../views/RecipesView.vue'),
    },
    {
      path: '/ajouter-recette',
      name: 'ajouter-recette',
      component: () => import('../views/AddRecipeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/recettes/:id/modifier',
      name: 'modifier-recette',
      component: () => import('../views/AddRecipeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/favoris',
      name: 'favoris',
      component: () => import('../views/FavorisView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.estConnecte) {
    return '/connexion'
  }
})

export default router