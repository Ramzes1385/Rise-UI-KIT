import '@testing-library/jest-dom/vitest'
import type { Group, Mesh, Scene } from 'three'
import userEvent from '@testing-library/user-event'
import { useMapEnvironment } from './imageMap3d.test-utils'
import { screen, waitFor, within } from '@testing-library/vue'
import type { ImageMap3DData } from '../types/imageMap3dData.types'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', width: 800, height: 400, elevation: 300 },
	],
	groups: [
		{ id: 'food', title: 'Еда', color: '#ff8800', icon: 'star' },
		{ id: 'shops', title: 'Магазины' },
	],
	objects: [
		{ id: 'start', type: 'rect', title: 'Вход', x: 0.05, y: 0.45, width: 0.1, height: 0.1, layer: 'f1', group: 'food' },
		{ id: 'goal', type: 'rect', title: 'Кафе', x: 0.85, y: 0.45, width: 0.1, height: 0.1, layer: 'f2', group: 'shops' },
		{ id: 'pin', type: 'point', title: 'Метка', x: 0.5, y: 0.2, layer: 'f1', label: 'M' },
		{ id: 'blink', type: 'point', title: 'Мигает', x: 0.6, y: 0.2, layer: 'f1', label: 'B', isPulsing: true },
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

const env = useMapEnvironment()

describe('BaseImageMap3D: легенда', () => {
	it('hasLegend показывает группы, как в 2D; по умолчанию легенды нет', async () => {
		const first = await env.renderMap({ data: DATA, hasLegend: true, customClass: { legend: 'my-legend' } })
		const legend = screen.getByRole('list', { name: 'Легенда' })
		expect(legend).toHaveClass('base-image-map__legend', 'my-legend')
		expect(
			within(legend)
				.getAllByRole('listitem')
				.map(item => item.textContent?.trim()),
		).toEqual(['Еда', 'Магазины'])
		first.unmount()
		await env.renderMap({ data: DATA })
		expect(screen.queryByRole('list', { name: 'Легенда' })).toBeNull()
	})
})

describe('BaseImageMap3D: полноэкранный режим', () => {
	it('кнопка в панели камеры включает запасной режим: класс корня, aria-pressed, Escape и возврат фокуса', async () => {
		const user = userEvent.setup()
		const { container } = await env.renderMap({ data: DATA })
		const root = container.querySelector('.base-image-map-3d') as HTMLElement
		const viewport = container.querySelector('.base-image-map-3d__viewport') as HTMLElement
		expect(viewport.style.aspectRatio).not.toBe('')
		const button = within(screen.getByRole('group', { name: 'Камера' })).getByRole('button', { name: 'Во весь экран' })
		expect(button).toHaveAttribute('aria-pressed', 'false')
		await user.click(button)
		expect(root).toHaveClass('base-image-map-3d--fullscreen', 'base-image-map-3d--fullscreen-fallback')
		expect(button).toHaveAttribute('aria-pressed', 'true')
		expect(viewport.style.aspectRatio).toBe('')
		await user.keyboard('{Escape}')
		await waitFor(() => expect(root).not.toHaveClass('base-image-map-3d--fullscreen'))
		expect(button).toHaveAttribute('aria-pressed', 'false')
		expect(viewport.style.aspectRatio).not.toBe('')
		;(document.activeElement as HTMLElement | null)?.blur()
		await user.click(button)
		await user.click(button)
		await waitFor(() => expect(button).toHaveFocus())
	})

	it('hasFullscreen: false убирает кнопку; без кнопок масштаба она остаётся одна', async () => {
		const first = await env.renderMap({ data: DATA, hasFullscreen: false })
		expect(screen.queryByRole('button', { name: 'Во весь экран' })).toBeNull()
		first.unmount()
		await env.renderMap({ data: DATA, hasZoomControls: false })
		expect(screen.queryByRole('button', { name: 'Увеличить' })).toBeNull()
		expect(screen.getByRole('button', { name: 'Во весь экран' })).toBeInTheDocument()
	})
})

describe('BaseImageMap3D: пульсация меток', () => {
	const pointsOf = (container: Element) => [...container.querySelectorAll('.base-image-map-3d__point')]
	const pulsing = (container: Element) => pointsOf(container).map(point => point.classList.contains('base-image-map-3d__point--pulsing'))

	it('isPulsing у карты — все метки; у точки — только она; по умолчанию без пульсации', async () => {
		const first = await env.renderMap({ data: DATA })
		expect(pulsing(first.container)).toEqual([false, true])
		first.unmount()
		const second = await env.renderMap({ data: DATA, isPulsing: true })
		expect(pulsing(second.container)).toEqual([true, true])
	})
})

describe('BaseImageMap3D: маршрут через этажи', () => {
	const routeOf = (scene: () => Scene) => scene().getObjectByName('rise-route') as Group
	const tubesAndMarkers = (route: Group) => ({
		tubes: route.children.filter(child => (child as Mesh).geometry?.type === 'TubeGeometry').length,
		markers: route.children.filter(child => (child as Mesh).geometry?.type === 'SphereGeometry').length,
	})
	const props = { data: DATA, hasRoutes: true, route: { from: 'start', to: 'goal' } }

	it('stack: одна трубка через этажи, метки начала и конца', async () => {
		const { scene } = await env.renderMap({ ...props, layerMode: 'stack' })
		expect(tubesAndMarkers(routeOf(scene))).toEqual({ tubes: 1, markers: 2 })
	})

	it('single: только участок текущего этажа и метка перехода; смена этажа перестраивает маршрут', async () => {
		const { scene, exposed } = await env.renderMap({ ...props, layerMode: 'single' })
		expect(tubesAndMarkers(routeOf(scene))).toEqual({ tubes: 1, markers: 2 })
		const first = routeOf(scene)
		exposed.value?.setLayer('f2')
		await waitFor(() => {
			env.flushFrames()
			expect(routeOf(scene)).not.toBe(first)
		})
		expect(tubesAndMarkers(routeOf(scene))).toEqual({ tubes: 1, markers: 2 })
	})

	it('single: на этаже без участка маршрута сцена без трубки', async () => {
		const data: ImageMap3DData = {
			...DATA,
			layers: [...DATA.layers, { id: 'f3', title: 'Этаж 3', width: 800, height: 400, elevation: 600 }],
		}
		const { scene, exposed } = await env.renderMap({ ...props, data, layerMode: 'single' })
		exposed.value?.setLayer('f3')
		await waitFor(() => {
			env.flushFrames()
			expect(scene().getObjectByName('rise-route')).toBeUndefined()
		})
	})
})
