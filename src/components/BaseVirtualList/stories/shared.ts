const CITIES = ['Москва', 'Казань', 'Волгоград', 'Самара', 'Пермь']

export const ORDERS = Array.from({ length: 10000 }, (_, index) => ({
	id: 1000 + index,
	title: `Заказ № ${1000 + index}`,
	city: CITIES[index % CITIES.length],
	total: `${((index * 7919) % 90000) + 1000} ₽`,
}))

export const ROW_STYLE =
	'display: flex; justify-content: space-between; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--rise-border)'
