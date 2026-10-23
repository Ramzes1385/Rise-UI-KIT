import type { ImageMapData, ImageMapFilter, ImageMapObject } from '../../types/imageMapData.types'

export const DIRECTORY_GROUPS = [
	{ id: 'food', title: 'Кафе', color: 'var(--rise-warning)', icon: 'star' },
	{ id: 'shops', title: 'Магазины', color: 'var(--rise-primary)' },
]

export const DIRECTORY_FILTERS: ImageMapFilter[] = [
	{ id: 'groups', title: 'Категории' },
	{
		id: 'amenities',
		title: 'Удобства',
		type: 'tags',
		logic: 'and',
		options: [
			{ value: 'wifi', label: 'Wi-Fi' },
			{ value: 'parking', label: 'Парковка' },
		],
	},
	{ id: 'open', title: 'Сейчас', type: 'switch', options: [{ value: 'open', label: 'Открыто' }] },
	{
		id: 'brand',
		title: 'Бренд',
		type: 'select',
		options: [
			{ value: 'alpha', label: 'Альфа' },
			{ value: 'beta', label: 'Бета' },
		],
	},
]

const PLAN =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect id="hall" width="50" height="50"/><rect id="room" x="50" width="50" height="50"/></svg>'

const DIRECTORY_OBJECTS: ImageMapObject[] = [
	{
		id: 'shop-10',
		type: 'point',
		layer: 'f1',
		title: 'Магазин 10',
		x: 0.1,
		y: 0.1,
		group: 'shops',
		tags: ['wifi', 'parking', 'open'],
		description: 'Одежда',
	},
	{ id: 'shop-2', type: 'point', layer: 'f1', title: 'Магазин 2', x: 0.2, y: 0.2, group: 'shops', tags: ['wifi', 'beta'] },
	{
		id: 'cafe',
		type: 'rect',
		layer: 'f1',
		title: 'Ёлка',
		x: 0.3,
		y: 0.3,
		width: 0.1,
		height: 0.1,
		group: 'food',
		keywords: ['кофе'],
		tags: ['parking', 'alpha'],
	},
	{ id: 'atm', type: 'point', layer: 'f1', title: 'Банкомат', x: 0.4, y: 0.4, action: 'none' },
	{ id: 'secret', type: 'point', layer: 'f1', title: 'Склад', x: 0.5, y: 0.5, group: 'shops', isHiddenInDirectory: true },
	{ id: 'closed', type: 'point', layer: 'f1', title: 'Закрыто', x: 0.6, y: 0.6, group: 'food', isDisabled: true },
	{ id: 'hall', type: 'svg', layer: 'f2', elementId: 'hall', title: 'Зал', group: 'food', tags: ['wifi'] },
	{ id: 'room', type: 'svg', layer: 'f2', elementId: 'room', title: 'Комната', group: 'shops', tags: ['parking'] },
	{
		id: 'site',
		type: 'point',
		layer: 'f2',
		title: 'Сайт',
		x: 0.7,
		y: 0.7,
		action: 'link',
		link: 'https://example.com',
		isLinkExternal: true,
	},
]

export function directoryData(overrides: Partial<ImageMapData> = {}): ImageMapData {
	return {
		layers: [
			{ id: 'f1', title: 'Первый этаж', shortTitle: '1 эт.', width: 100, height: 100 },
			{ id: 'f2', title: 'Второй этаж', svg: PLAN, width: 100, height: 100 },
		],
		groups: DIRECTORY_GROUPS,
		filters: DIRECTORY_FILTERS,
		objects: DIRECTORY_OBJECTS,
		...overrides,
	}
}

export const DIRECTORY_PROPS = { hasZoomControls: false, hasFullscreen: false, hasDirectory: true }

export function entryOf(container: Element, id: string): HTMLElement {
	return container.querySelector(`[data-image-map-entry="${id}"]`) as HTMLElement
}

export function objectOf(container: Element, id: string): Element | null {
	return container.querySelector(`.base-image-map__stage [data-image-map-object="${id}"]`)
}

export function entryIds(container: Element): string[] {
	return [...container.querySelectorAll('[data-image-map-entry]')].map(item => item.getAttribute('data-image-map-entry') ?? '')
}
