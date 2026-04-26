import type { RouteRecordRaw } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'
import { authMiddleware } from '../middleware/auth.middleware'

const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'home',
		component: () => import('@/pages/HomePage/HomePage.vue'),
	},
	{
		path: '/catalog',
		name: 'catalog',
		component: () => import('@/pages/CatalogPage/CatalogPage.vue'),
	},
	{
		path: '/painting/:id',
		name: 'painting',
		component: () => import('@/pages/PaintingPage/PaintingPage.vue'),
	},
	{
		path: '/profile',
		name: 'profile',
		component: () => import('@/pages/ProfilePage/ProfilePage.vue'),
		meta: { requiresAuth: true },
	},
	{
		path: '/orders',
		name: 'orders',
		component: () => import('@/pages/OrdersPage/OrdersPage.vue'),
		meta: { requiresAuth: true },
	},
	{
		path: '/about',
		name: 'about',
		component: () => import('@/pages/AboutPage/AboutPage.vue'),
	},
	{
		path: '/contacts',
		name: 'contacts',
		component: () => import('@/pages/ContactsPage/ContactsPage.vue'),
	},
	{
		path: '/ui-kit',
		name: 'ui-kit',
		component: () => import('@/pages/UiKitPage/UiKitPage.vue'),
	},
]

export const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior() {
		return { top: 0 }
	},
})

router.beforeEach(authMiddleware)
