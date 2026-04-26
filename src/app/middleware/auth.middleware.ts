import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

/**
 * Middleware для проверки авторизации (заглушка)
 */
export function authMiddleware(
	to: RouteLocationNormalized,
	from: RouteLocationNormalized,
	next: NavigationGuardNext,
): void {
	const isAuth = true // В реальном приложении проверка из стора

	if (to.meta.requiresAuth && !isAuth) {
		next({ name: 'home' })
	} else {
		next()
	}
}
