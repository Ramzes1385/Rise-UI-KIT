import '@testing-library/jest-dom/vitest'
import { createUiKitPlugin } from '@/plugin'
import userEvent from '@testing-library/user-event'
import BaseImageMap3D from '../../ui/BaseImageMap3D.vue'
import { render, screen, waitFor } from '@testing-library/vue'
import { IMAGE_MAP_3D_PARTS } from '../../types/BaseImageMap3D.types'
import type { ImageMap3DData } from '../../types/imageMap3dData.types'
import { createFakeRenderer, useMapEnvironment } from '../imageMap3d.test-utils'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', width: 800, height: 400, elevation: 300 },
	],
	groups: [
		{ id: 'food', title: 'Еда', color: '#ff8800', icon: 'star' },
		{ id: 'shops', title: 'Магазины' },
	],
	filters: [{ id: 'kind', title: 'Вид', type: 'tags', options: [{ value: 'shop', label: 'Магазин' }] }],
	objects: [
		{ id: 'start', type: 'rect', title: 'Вход', x: 0.05, y: 0.45, width: 0.1, height: 0.1, layer: 'f1', group: 'food' },
		{ id: 'goal', type: 'rect', title: 'Кафе', x: 0.85, y: 0.45, width: 0.1, height: 0.1, layer: 'f2', group: 'shops' },
		{ id: 'pin', type: 'point', title: 'Метка', x: 0.5, y: 0.2, layer: 'f1', label: 'M' },
	],
	routes: {
		nodes: [
			{ id: 'a', layer: 'f1', x: 0.1, y: 0.5, object: 'start' },
			{ id: 'b', layer: 'f1', x: 0.5, y: 0.5 },
			{ id: 'c', layer: 'f2', x: 0.6, y: 0.5 },
			{ id: 'd', layer: 'f2', x: 0.9, y: 0.5, object: 'goal' },
		],
		edges: [
			['a', 'b'],
			['c', 'd'],
		],
		transitions: [{ id: 'lift', type: 'elevator', title: 'Лифт', nodes: ['b', 'c'] }],
	},
}

const UI_ALL = Object.fromEntries([['root', 'u-root'], ...IMAGE_MAP_3D_PARTS.map(part => [part, `u-${part}`])])

const SHARED_PARTS = [
	'legend',
	'legend-item',
	'swatch',
	'directory',
	'search',
	'filters',
	'results',
	'list',
	'entry',
	'route',
	'route-steps',
	'route-step',
]

const OWN_PARTS = ['views', 'toolbar', 'layers', 'camera', 'viewport', 'canvas', 'point', 'marker', 'label', 'hint', 'status']

const FULL_PROPS = {
	data: DATA,
	hasLegend: true,
	hasDirectory: true,
	hasSearch: true,
	hasFilters: true,
	hasRoutes: true,
	has2dToggle: true,
	route: { from: 'start', to: 'goal' },
}

const env = useMapEnvironment()

describe('BaseImageMap3D: проп ui', () => {
	it('части 3D-вида получают БЭМ-класс кита и класс из ui; customClass сохраняется', async () => {
		const { container } = await env.renderMap({ ...FULL_PROPS, ui: UI_ALL, customClass: { viewport: 'own-viewport' } })
		const root = container.querySelector('.base-image-map-3d') as HTMLElement
		expect(root).toHaveClass('base-image-map-3d', 'u-root')
		for (const part of OWN_PARTS) {
			const [element] = Array.from(root.querySelectorAll(`.base-image-map-3d__${part}`))
			expect(element, `.base-image-map-3d__${part}`).toHaveClass(`base-image-map-3d__${part}`, `u-${part}`)
		}
		expect(root.querySelectorAll('.base-image-map-3d__hint.u-hint')).toHaveLength(2)
		expect(root.querySelector('.base-image-map-3d__viewport')).toHaveClass('own-viewport')
		expect(root.querySelector('.base-image-map-3d__canvas')).toHaveAttribute('aria-hidden', 'true')
	})

	it('легенда, список объектов и панель маршрута внутри 3D-карты: классы ui поверх классов BaseImageMap', async () => {
		const { container } = await env.renderMap({ ...FULL_PROPS, ui: UI_ALL })
		const root = container.querySelector('.base-image-map-3d') as HTMLElement
		for (const part of SHARED_PARTS) {
			const [element] = Array.from(root.querySelectorAll(`.base-image-map__${part}`))
			expect(element, `.base-image-map__${part}`).toHaveClass(`base-image-map__${part}`, `u-${part}`)
		}
		expect(root.querySelector('.base-image-map-3d__directory')).toHaveClass('base-image-map__directory', 'u-directory')
	})

	it('карточка объекта у точки — часть tooltip, окно карточки — popup', async () => {
		const user = userEvent.setup()
		const { container } = await env.renderMap({
			data: DATA,
			hasDirectory: true,
			ui: { tooltip: 'u-tooltip', popup: 'u-popup' },
			customClass: { tooltip: 'own-tooltip', popup: 'own-popup' },
		})
		await user.hover(screen.getByRole('button', { name: /Вход/ }))
		const card = await waitFor(() => {
			const found = container.querySelector('.base-image-map-3d__card')
			expect(found).not.toBeNull()
			return found as HTMLElement
		})
		expect(card).toHaveClass('base-image-map-3d__tooltip', 'u-tooltip', 'own-tooltip')
		await user.click(screen.getByRole('button', { name: /Вход/ }))
		const popup = await waitFor(() => {
			const found = document.querySelector('.base-image-map-3d__popup')
			expect(found).not.toBeNull()
			return found as HTMLElement
		})
		expect(popup).toHaveClass('u-popup', 'own-popup')
	})

	it('без ui — только классы кита, без лишних классов частей', async () => {
		const { container } = await env.renderMap({ data: DATA, hasDirectory: true })
		const root = container.querySelector('.base-image-map-3d') as HTMLElement
		expect(root.className.split(' ').filter(name => name.startsWith('u-'))).toEqual([])
		expect(root.querySelector('.base-image-map-3d__viewport')?.className).toBe('base-image-map-3d__viewport')
		expect(root.querySelector('.base-image-map__directory')?.className).toContain('base-image-map__directory')
	})

	it('2D-вид получает тот же объект ui', async () => {
		const { container } = await env.renderMap({
			data: DATA,
			view: '2d',
			hasDirectory: true,
			ui: { root: 'u-root', viewport: 'u-viewport', entry: 'u-entry', camera: 'u-camera' },
		})
		const map = container.querySelector('.base-image-map') as HTMLElement
		expect(map).toHaveClass('u-root')
		expect(map.querySelector('.base-image-map__viewport')).toHaveClass('u-viewport')
		expect(map.querySelector('.base-image-map__entry')).toHaveClass('u-entry')
		expect(container.querySelector('canvas')).toBeNull()
	})
})

describe('BaseImageMap3D: defaults.BaseImageMap3D.ui плагина', () => {
	function renderWithDefaults(props: Record<string, unknown>, ui: Record<string, Record<string, string>>) {
		return render(BaseImageMap3D, {
			props: { data: DATA, rendererFactory: () => createFakeRenderer(), ...props },
			global: { plugins: [createUiKitPlugin({ defaults: { BaseImageMap3D: ui } })] },
		})
	}

	it('в 3D-виде классы глобальные, затем экземпляра; у вложенных частей — тоже', async () => {
		const { container } = renderWithDefaults(
			{ hasDirectory: true, ui: { viewport: 'own-viewport', entry: 'own-entry' } },
			{ ui: { root: 'g-root', viewport: 'g-viewport', entry: 'g-entry' } },
		)
		await waitFor(() => expect(container.querySelector('canvas')).not.toBeNull())
		expect(container.querySelector('.base-image-map-3d')).toHaveClass('g-root')
		expect(container.querySelector('.base-image-map-3d__viewport')?.className).toBe(
			'base-image-map-3d__viewport g-viewport own-viewport',
		)
		expect(container.querySelector('.base-image-map__entry')?.className).toContain('base-image-map__entry g-entry own-entry')
	})

	it('в 2D-виде глобальные классы 3D-карты тоже доходят до BaseImageMap', () => {
		const { container } = renderWithDefaults(
			{ view: '2d', ui: { viewport: 'own-viewport' } },
			{ ui: { root: 'g-root', viewport: 'g-viewport' } },
		)
		const map = container.querySelector('.base-image-map') as HTMLElement
		expect(map).toHaveClass('g-root')
		expect(map.querySelector('.base-image-map__viewport')?.className).toBe('base-image-map__viewport g-viewport own-viewport')
	})
})
