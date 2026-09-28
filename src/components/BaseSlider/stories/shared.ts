import { within } from 'storybook/test'
import { STORY_IMAGES } from '@/stories/helpers'
import type { SliderItem } from '../types/BaseSlider.types'

const TOURS = [
	{ title: 'Рассвет на плато', description: 'Однодневный маршрут · 12 км' },
	{ title: 'Перевал в тумане', description: 'Два дня с ночёвкой в горном приюте' },
	{ title: 'Зелёная долина', description: 'Лёгкая прогулка для всей семьи' },
	{ title: 'Сумерки над хребтом', description: 'Вечерний подъём к смотровой площадке' },
	{ title: 'Закат у кромки леса', description: 'Фототур с гидом · 3 часа' },
	{ title: 'Пустынные холмы', description: 'Джип-тур по каньонам' },
]

export const SLIDES: SliderItem[] = STORY_IMAGES.map((image, index) => ({ src: image.src, alt: image.alt, ...TOURS[index] }))

export const PHOTOS: SliderItem[] = STORY_IMAGES.map(image => ({ src: image.src, alt: image.alt }))

export const PROMOS = [
	{
		title: 'Скидка 20% на весенние туры',
		subtitle: 'До 31 мая',
		text: 'Бронируйте маршруты апреля и мая со скидкой — места ограничены.',
	},
	{ title: 'Снаряжение в аренду', subtitle: 'Новое', text: 'Палатки, спальники и треккинговые палки — прямо на базе маршрута.' },
	{
		title: 'Подарочный сертификат',
		subtitle: 'Любой номинал',
		text: 'Подарите поход: сертификат действует год и подходит для всех туров.',
	},
	{ title: 'Клуб путешественников', subtitle: 'Бесплатно', text: 'Накопительные баллы за каждый маршрут и закрытые встречи с гидами.' },
]

export const PROMO_ITEMS: SliderItem[] = PROMOS.map(promo => ({ src: '', alt: promo.title, title: promo.title }))

export function sliderNav(root: HTMLElement, number: number, total = SLIDES.length): HTMLElement {
	return within(root).getAllByRole('button', { name: `Слайд ${number} из ${total}` })[0]!
}
