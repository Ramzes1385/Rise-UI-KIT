import { literal } from '@/stories/helpers'

const CITIES = ['Москва', 'Казань', 'Волгоград', 'Самара', 'Пермь']

export const ORDERS = Array.from({ length: 10000 }, (_, index) => ({
	id: 1000 + index,
	title: `Заказ № ${1000 + index}`,
	city: CITIES[index % CITIES.length],
	total: `${((index * 7919) % 90000) + 1000} ₽`,
}))

export const ROW_STYLE =
	'display: flex; justify-content: space-between; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--rise-border)'

export const ordersScript = (length: number): string =>
	[
		`const cities = ${literal(CITIES)}`,
		`const items = Array.from({ length: ${length} }, (_, index) => ({`,
		'\tid: 1000 + index,',
		'\ttitle: `Заказ № ${1000 + index}`,',
		'\tcity: cities[index % cities.length],',
		'\ttotal: `${((index * 7919) % 90000) + 1000} ₽`,',
		'}))',
		`const rowStyle = ${literal(ROW_STYLE)}`,
	].join('\n')
