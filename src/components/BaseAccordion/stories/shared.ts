import type { BaseAccordionItem } from '../types/BaseAccordion.types'

export const ITEMS: BaseAccordionItem[] = [
	{
		label: 'Как оформить заказ?',
		content: 'Добавьте товары в корзину, укажите адрес доставки и выберите способ оплаты. Подтверждение придёт на почту.',
		defaultOpen: true,
	},
	{ label: 'Сколько стоит доставка?', content: 'Курьером по городу — 290 ₽, при заказе от 3000 ₽ — бесплатно.' },
	{ label: 'Можно ли вернуть товар?', content: 'Да, в течение 14 дней с момента получения, если сохранены упаковка и чек.' },
	{ label: 'Как связаться с поддержкой?', content: 'Напишите в чат на сайте или позвоните по номеру 8 800 555-35-35.' },
]

const EXTRA_ITEM: BaseAccordionItem = { label: 'Есть ли подарочная упаковка?', content: 'Да, её можно выбрать при оформлении заказа.' }

export function showcaseItems(index: number): BaseAccordionItem[] {
	const pool = [...ITEMS, EXTRA_ITEM].map(item => ({ ...item, defaultOpen: false }))
	return [0, 1, 2].map(offset => ({ ...pool[(index + offset) % pool.length], defaultOpen: offset === 0 }))
}
