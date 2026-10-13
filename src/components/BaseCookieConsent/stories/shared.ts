import type { CookieCategory } from '../types/BaseCookieConsent.types'

export const CATEGORIES: CookieCategory[] = [
	{ id: 'necessary', label: 'Необходимые', description: 'Корзина, вход в аккаунт и защита от злоупотреблений.', isRequired: true },
	{ id: 'analytics', label: 'Аналитика', description: 'Показывают, какие страницы читают чаще всего.' },
	{ id: 'marketing', label: 'Маркетинг', description: 'Помогают показывать подходящие предложения.' },
]

export const ALL_IDS = CATEGORIES.map(category => category.id)

export const STORAGE_NAME = 'rise-cookie-consent:story-remembered'
