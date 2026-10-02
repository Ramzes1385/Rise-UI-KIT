import type { ImageMapRouteNode, ImageMapRoutes } from '../types/ImageMapRoutes.types'
import type { ImageMapData, ImageMapLayer, ImageMapObject } from '../types/imageMapData.types'

const WIDTH = 1000
const HEIGHT = 600
const LEVELS = [1, 2, 3]
const COLUMNS = [155, 365, 575, 785]
const CORRIDOR_X = [60, ...COLUMNS, 930]
const ROWS = [
	{ top: 40, doorY: 0.4 },
	{ top: 360, doorY: 0.6 },
]

const SHOPS: Record<number, string[]> = {
	1: ['Кофейня', 'Аптека', 'Книги', 'Цветы'],
	2: ['Одежда', 'Обувь', 'Спорт', 'Электроника'],
	3: ['Кино', 'Фудкорт', 'Детская комната', 'Служебное помещение'],
}

const SLOTS = [
	{ row: 0, column: 0 },
	{ row: 0, column: 2 },
	{ row: 1, column: 1 },
	{ row: 1, column: 3 },
]

function shopId(level: number, slot: number): string {
	return `f${level}-shop-${slot + 1}`
}

function planSvg(level: number): string {
	const shops = ROWS.flatMap((row, rowIndex) =>
		COLUMNS.map((center, column) => {
			const slot = SLOTS.findIndex(item => item.row === rowIndex && item.column === column)
			const id = slot >= 0 ? ` id="${shopId(level, slot)}"` : ''
			return `<rect${id} x="${center - 95}" y="${row.top}" width="190" height="200" rx="8" fill="#e8edf5" stroke="#94a3b8" stroke-width="2"/>`
		}),
	)
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${HEIGHT}">`,
		`<rect width="${WIDTH}" height="${HEIGHT}" rx="16" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>`,
		`<rect x="30" y="260" width="940" height="80" fill="#fefce8"/>`,
		...shops,
		`<rect x="900" y="40" width="60" height="200" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>`,
		`<rect x="900" y="360" width="60" height="200" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>`,
		level < 3 ? `<rect x="30" y="270" width="60" height="60" fill="#fde68a" stroke="#d97706" stroke-width="2"/>` : '',
		`</svg>`,
	].join('')
}

function corridorNodes(level: number): ImageMapRouteNode[] {
	const layer = `floor-${level}`
	const corridor = CORRIDOR_X.map((x, index) => ({ id: `f${level}-c${index}`, layer, x: x / WIDTH, y: 0.5 }))
	const doors = SLOTS.map((slot, index) => ({
		id: `f${level}-door-${index + 1}`,
		layer,
		x: (COLUMNS[slot.column] as number) / WIDTH,
		y: (ROWS[slot.row] as { doorY: number }).doorY,
		object: shopId(level, index),
	}))
	const landings = [
		{ id: `f${level}-stairs`, layer, x: 0.93, y: 0.38 },
		{ id: `f${level}-lift`, layer, x: 0.93, y: 0.62 },
	]
	return [...corridor, ...doors, ...landings]
}

function corridorEdges(level: number): [string, string][] {
	const corridor = CORRIDOR_X.slice(1).map((_, index): [string, string] => [`f${level}-c${index}`, `f${level}-c${index + 1}`])
	const doors = SLOTS.map((slot, index): [string, string] => [`f${level}-door-${index + 1}`, `f${level}-c${slot.column + 1}`])
	const reachable = level === 3 ? doors.slice(0, 3) : doors
	return [...corridor, ...reachable, [`f${level}-stairs`, `f${level}-c5`], [`f${level}-lift`, `f${level}-c5`]]
}

export const MALL_ROUTES: ImageMapRoutes = {
	nodes: LEVELS.flatMap(corridorNodes),
	edges: LEVELS.flatMap(corridorEdges),
	transitions: [
		{ id: 'stairs', type: 'stairs', title: 'Лестница у входа', nodes: ['f1-stairs', 'f2-stairs', 'f3-stairs'] },
		{ id: 'lift', type: 'elevator', title: 'Лифт', nodes: ['f1-lift', 'f2-lift', 'f3-lift'] },
		{ id: 'escalator-up', type: 'escalator', title: 'Эскалатор вверх', nodes: ['f1-c0', 'f2-c0'], isOneWay: true },
	],
	metersPerWidth: 120,
}

const LAYERS: ImageMapLayer[] = LEVELS.map(level => ({
	id: `floor-${level}`,
	title: `${level} этаж`,
	shortTitle: String(level),
	svg: planSvg(level),
	width: WIDTH,
	height: HEIGHT,
}))

function shopObjects(level: number): ImageMapObject[] {
	return (SHOPS[level] as string[]).map((title, index) => ({
		id: shopId(level, index),
		type: 'svg',
		elementId: shopId(level, index),
		layer: `floor-${level}`,
		title,
		action: 'none',
	}))
}

export const IMAGE_MAP_MALL_ROUTES: ImageMapData = {
	version: 1,
	layers: LAYERS,
	objects: LEVELS.flatMap(shopObjects),
	routes: MALL_ROUTES,
}
