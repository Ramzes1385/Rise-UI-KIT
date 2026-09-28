/** Детерминированные данные для stories: без внешних URL, new Date() без аргументов и Math.random() — скриншоты и play-проверки должны давать одинаковый результат на любой машине и в любой день. */

import type { PlaceholderOptions } from './types/helpers.types'

/**
 * Иллюстрация-пейзаж в виде SVG data URI: градиентное небо, солнце и два слоя гор.
 * Размеры и оттенок задают вид; результат одинаков при одинаковых аргументах.
 */
export function placeholderImage({ width = 800, height = 500, hue = 24 }: PlaceholderOptions = {}): string {
	const w = width
	const h = height
	const svg = [
		`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
		`<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">`,
		`<stop offset="0" stop-color="hsl(${hue} 85% 90%)"/><stop offset="1" stop-color="hsl(${(hue + 25) % 360} 80% 72%)"/>`,
		`</linearGradient></defs>`,
		`<rect width="${w}" height="${h}" fill="url(#sky)"/>`,
		`<circle cx="${w * 0.72}" cy="${h * 0.32}" r="${Math.min(w, h) * 0.11}" fill="hsl(${hue} 100% 97%)"/>`,
		`<path d="M0 ${h * 0.74} L${w * 0.28} ${h * 0.46} L${w * 0.52} ${h * 0.7} L${w * 0.74} ${h * 0.5} L${w} ${h * 0.76} V${h} H0Z" fill="hsl(${(hue + 10) % 360} 40% 45%)"/>`,
		`<path d="M0 ${h * 0.86} L${w * 0.38} ${h * 0.64} L${w * 0.7} ${h * 0.82} L${w} ${h * 0.7} V${h} H0Z" fill="hsl(${(hue + 15) % 360} 35% 28%)"/>`,
		`</svg>`,
	].join('')
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** Набор иллюстраций для галерей и слайдеров: разные оттенки, одинаковые пропорции 16:10. */
export const STORY_IMAGES = [
	{ src: placeholderImage({ hue: 24 }), alt: 'Горы на рассвете' },
	{ src: placeholderImage({ hue: 200 }), alt: 'Горы в тумане' },
	{ src: placeholderImage({ hue: 150 }), alt: 'Зелёная долина' },
	{ src: placeholderImage({ hue: 270 }), alt: 'Горы в сумерках' },
	{ src: placeholderImage({ hue: 340 }), alt: 'Закат над хребтом' },
	{ src: placeholderImage({ hue: 45 }), alt: 'Пустынные холмы' },
] as const

/** Адрес, который гарантированно не загрузится: для состояний ошибки загрузки изображения. */
export const BROKEN_IMAGE_SRC = '/__story-missing-image__.png'

/** Аватар-иллюстрация (SVG data URI): круг с силуэтом на цветном фоне. */
export function avatarImage(hue = 24): string {
	const svg = [
		`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">`,
		`<rect width="128" height="128" fill="hsl(${hue} 70% 85%)"/>`,
		`<circle cx="64" cy="50" r="24" fill="hsl(${hue} 45% 45%)"/>`,
		`<path d="M20 124 C24 92 44 80 64 80 C84 80 104 92 108 124Z" fill="hsl(${hue} 45% 45%)"/>`,
		`</svg>`,
	].join('')
	return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** «Сегодня» для stories: 15 мая 2025, 10:30. Используйте вместо new Date(). */
export const STORY_TODAY = new Date(2025, 4, 15, 10, 30)

/** Дата, смещённая от STORY_TODAY на days дней (отрицательные — в прошлое). */
export function storyDate(days: number, hours = 10, minutes = 30): Date {
	return new Date(STORY_TODAY.getFullYear(), STORY_TODAY.getMonth(), STORY_TODAY.getDate() + days, hours, minutes)
}

/** Пользователи для аватаров, чатов, таблиц. */
export const STORY_USERS = [
	{ id: 1, name: 'Анна Смирнова', role: 'Дизайнер', email: 'anna@example.com', avatar: avatarImage(24) },
	{ id: 2, name: 'Иван Петров', role: 'Разработчик', email: 'ivan@example.com', avatar: avatarImage(210) },
	{ id: 3, name: 'Мария Кузнецова', role: 'Менеджер', email: 'maria@example.com', avatar: avatarImage(150) },
	{ id: 4, name: 'Олег Соколов', role: 'Аналитик', email: 'oleg@example.com', avatar: avatarImage(280) },
	{ id: 5, name: 'Екатерина Волкова', role: 'Тестировщик', email: 'kate@example.com', avatar: avatarImage(340) },
] as const
