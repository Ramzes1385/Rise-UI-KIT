import { placeholderImage } from '@/stories/helpers'
import type { ImageMapData, ImageMapObject } from '../types/imageMapData.types'

const PLAN_WIDTH = 1000
const PLAN_HEIGHT = 600
const SHOPS_PER_ROW = 4
const SHOP_WIDTH = 200
const SHOP_HEIGHT = 200
const SHOP_GAP = 20
const ROW_TOP = [40, 360]

function shopRects(level: number): string {
	return ROW_TOP.flatMap((top, row) =>
		Array.from({ length: SHOPS_PER_ROW }, (_, index) => {
			const id = `f${level}-shop-${row * SHOPS_PER_ROW + index + 1}`
			const x = 60 + index * (SHOP_WIDTH + SHOP_GAP)
			return `<rect id="${id}" x="${x}" y="${top}" width="${SHOP_WIDTH}" height="${SHOP_HEIGHT}" rx="8" fill="#e8edf5" stroke="#94a3b8" stroke-width="2"/>`
		}),
	).join('')
}

function floorPlanSvg(level: number): string {
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${PLAN_WIDTH} ${PLAN_HEIGHT}">`,
		`<rect width="${PLAN_WIDTH}" height="${PLAN_HEIGHT}" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>`,
		`<rect x="40" y="260" width="920" height="80" fill="#fefce8"/>`,
		shopRects(level),
		`<rect id="f${level}-stairs" x="900" y="40" width="60" height="200" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>`,
		`<rect id="f${level}-lift" x="900" y="360" width="60" height="200" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>`,
		`<text x="500" y="308" font-size="22" text-anchor="middle" fill="#64748b">Этаж ${level}</text>`,
		`</svg>`,
	].join('')
}

const IMAGE_MAP_GROUPS = [
	{ id: 'food', title: 'Кафе и рестораны', color: 'var(--rise-warning)', icon: 'star' },
	{ id: 'shops', title: 'Магазины', color: 'var(--rise-primary)', icon: 'home' },
	{ id: 'service', title: 'Сервис', color: 'var(--rise-success)', icon: 'info' },
]

export const IMAGE_MAP_HOTSPOTS: ImageMapData = {
	version: 1,
	layers: [
		{ id: 'view', title: 'Горный курорт', image: placeholderImage({ width: 800, height: 500, hue: 200 }), width: 800, height: 500 },
	],
	groups: IMAGE_MAP_GROUPS,
	objects: [
		{
			id: 'peak',
			type: 'point',
			title: 'Вершина',
			x: 0.28,
			y: 0.47,
			group: 'service',
			label: 'Вершина',
			description: 'Смотровая площадка на высоте 2 100 м.\nПодъёмник работает с 9:00 до 18:00.',
			links: [{ label: 'Расписание', href: '#schedule' }],
		},
		{ id: 'sun', type: 'point', title: 'Солнце', x: 0.72, y: 0.32, group: 'food', isPulsing: true, description: 'Кафе на террасе' },
		{ id: 'lake', type: 'ellipse', title: 'Озеро', x: 0.5, y: 0.86, rx: 0.12, ry: 0.06, group: 'service', description: 'Прокат лодок' },
		{ id: 'forest', type: 'rect', title: 'Лес', x: 0.04, y: 0.7, width: 0.2, height: 0.22, group: 'shops', action: 'none' },
		{
			id: 'ridge',
			type: 'polygon',
			title: 'Хребет',
			points: [
				[0.52, 0.7],
				[0.74, 0.5],
				[0.96, 0.74],
			],
			action: 'link',
			link: '#ridge',
		},
		{ id: 'closed', type: 'point', title: 'Закрытая трасса', x: 0.9, y: 0.62, isDisabled: true },
	],
}

function floorObjects(level: number): ImageMapObject[] {
	const layer = `floor-${level}`
	const shops: ImageMapObject[] = [1, 2, 5, 6].map(index => ({
		id: `f${level}-shop-${index}`,
		type: 'svg',
		elementId: `f${level}-shop-${index}`,
		layer,
		title: `Магазин ${level}0${index}`,
		group: index % 2 ? 'shops' : 'food',
		description: `Этаж ${level}, павильон ${level}0${index}`,
	}))
	const transitions: ImageMapObject[] = [
		{ id: `f${level}-stairs`, type: 'svg', elementId: `f${level}-stairs`, layer, title: 'Лестница', group: 'service', action: 'none' },
		{
			id: `f${level}-lift`,
			type: 'svg',
			elementId: `f${level}-lift`,
			layer,
			title: `Лифт на этаж ${level === 3 ? 1 : level + 1}`,
			group: 'service',
			action: 'layer',
			targetLayer: `floor-${level === 3 ? 1 : level + 1}`,
		},
	]
	return [
		...shops,
		...transitions,
		{ id: `f${level}-info`, type: 'point', layer, title: 'Справочная', x: 0.5, y: 0.5, icon: 'info', group: 'service' },
	]
}

export const IMAGE_MAP_FLOORS: ImageMapData = {
	version: 1,
	layers: [1, 2, 3].map(level => ({
		id: `floor-${level}`,
		title: `Этаж ${level}`,
		shortTitle: String(level),
		svg: floorPlanSvg(level),
		width: PLAN_WIDTH,
		height: PLAN_HEIGHT,
	})),
	groups: IMAGE_MAP_GROUPS,
	objects: [1, 2, 3].flatMap(floorObjects),
}
