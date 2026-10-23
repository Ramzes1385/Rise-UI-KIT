import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { createUiKitPlugin } from '@/plugin'
import BaseImageMap from '../ui/BaseImageMap.vue'
import { IMAGE_MAP_FLOORS } from '../stories/fixtures'
import { IMAGE_MAP_PARTS } from '../types/BaseImageMap.types'
import type { ImageMapData } from '../types/imageMapData.types'
import { IMAGE_MAP_MALL_ROUTES } from '../stories/routesFixtures'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'
import { mockRects, mockViewport, objectElement, stageTransform } from './imageMap.test-utils'

const DATA: ImageMapData = {
	layers: [
		{ id: 'one', title: 'Этаж 1', shortTitle: '1', image: 'one.png', width: 800, height: 500 },
		{ id: 'two', title: 'Этаж 2', shortTitle: '2', image: 'two.png', width: 800, height: 500 },
		{ id: 'wide', title: 'Этаж 3', shortTitle: '3', image: 'wide.png', width: 1600, height: 500 },
	],
	groups: [{ id: 'shop', title: 'Магазины', color: '#0ea5e9' }],
	objects: [
		{ id: 'a', type: 'point', layer: 'one', title: 'Точка А', x: 0.25, y: 0.5, label: 'А', group: 'shop' },
		{ id: 'r', type: 'rect', layer: 'one', title: 'Зал', x: 0.5, y: 0.2, width: 0.2, height: 0.2, group: 'shop' },
		{ id: 'b', type: 'point', layer: 'two', title: 'Точка Б', x: 0.75, y: 0.5 },
	],
}

const LIST_AND_ROUTE_PARTS = ['directory', 'search', 'filters', 'results', 'list', 'entry', 'route', 'route-steps', 'route-step']

const motionGlobal = { stubs: { transition: false } }

function setup(props: Record<string, unknown> = {}, global: Record<string, unknown> = {}) {
	mockViewport()
	mockRects({})
	return render(BaseImageMap, { props: { data: DATA, hasFullscreen: false, ...props }, global })
}

function stages(container: Element): HTMLElement[] {
	return Array.from(container.querySelectorAll<HTMLElement>('.base-image-map__stage'))
}

afterEach(() => {
	vi.restoreAllMocks()
	vi.useRealTimers()
	document.documentElement.removeAttribute('data-rise-motion')
})

describe('BaseImageMap: проп ui', () => {
	it('классы частей добавляются к БЭМ-классам кита, customClass сохраняется', async () => {
		vi.useFakeTimers()
		const ui = Object.fromEntries([['root', 'u-root'], ...IMAGE_MAP_PARTS.map(part => [part, `u-${part}`])])
		const { container } = setup({ ui, hasLegend: true, customClass: { viewport: 'own-viewport' } })
		await nextTick()
		await fireEvent.pointerOver(objectElement(container, 'a'), { pointerType: 'mouse' })
		container.querySelector('.base-image-map__viewport')!.dispatchEvent(new WheelEvent('wheel', { deltaY: -100, cancelable: true }))
		await nextTick()
		const root = container.querySelector('.base-image-map')!
		expect(root).toHaveClass('base-image-map', 'u-root')
		const absent = ['svg', 'tooltip', ...LIST_AND_ROUTE_PARTS]
		for (const part of IMAGE_MAP_PARTS.filter(name => !absent.includes(name)))
			expect(root.querySelector(`.base-image-map__${part}`)).toHaveClass(`u-${part}`)
		expect(document.querySelector('.base-image-map__tooltip')).toHaveClass('u-tooltip')
		expect(root.querySelector('.base-image-map__viewport')).toHaveClass('own-viewport')
	})

	it('части списка объектов и панели «Как пройти» получают классы ui', () => {
		const ui = Object.fromEntries(LIST_AND_ROUTE_PARTS.map(part => [part, `u-${part}`]))
		const { container } = render(BaseImageMap, {
			props: {
				data: {
					...IMAGE_MAP_MALL_ROUTES,
					filters: [{ id: 'kind', title: 'Вид', type: 'tags', options: [{ value: 'shop', label: 'Магазин' }] }],
				},
				hasDirectory: true,
				hasSearch: true,
				hasFilters: true,
				hasRoutes: true,
				route: { from: 'f1-shop-1', to: 'f3-shop-1' },
				hasFullscreen: false,
				ui,
			},
		})
		for (const part of LIST_AND_ROUTE_PARTS) expect(container.querySelector(`.base-image-map__${part}`)).toHaveClass(`u-${part}`)
	})

	it('SVG-план получает класс ui', async () => {
		mockViewport()
		const { container } = render(BaseImageMap, { props: { data: IMAGE_MAP_FLOORS, hasFullscreen: false, ui: { svg: 'u-svg' } } })
		await waitFor(() => expect(container.querySelector('.base-image-map__svg')).toHaveClass('u-svg'))
	})

	it('классы плагина и экземпляра склеиваются; без ui — только классы кита', () => {
		const { container } = setup(
			{ ui: { viewport: 'own' } },
			{ plugins: [createUiKitPlugin({ defaults: { BaseImageMap: { ui: { viewport: 'app', root: 'app-root' } } } })] },
		)
		expect(container.querySelector('.base-image-map')).toHaveClass('app-root')
		expect(container.querySelector('.base-image-map__viewport')!.className).toMatch(/^base-image-map__viewport app own( |$)/)
		expect(container.querySelector('.base-image-map__marker')).toHaveAttribute('class', 'base-image-map__marker')
	})
})

describe('BaseImageMap: смена этажа', () => {
	it('прежний план растворяется поверх нового: переход base-image-map__stage, inert, затем удаляется', async () => {
		const { container } = setup({}, motionGlobal)
		await nextTick()
		await fireEvent.click(screen.getByRole('radio', { name: '2' }))
		await nextTick()
		const [leaving] = stages(container).filter(stage => stage.classList.contains('base-image-map__stage-leave-active'))
		expect(leaving).toBeDefined()
		expect(leaving).toHaveAttribute('inert')
		expect(stages(container)).toHaveLength(2)
		await waitFor(() => expect(stages(container)).toHaveLength(1))
		expect(stages(container)[0]).not.toHaveAttribute('inert')
	})

	it('пресет none — этаж меняется сразу, без перехода', async () => {
		document.documentElement.setAttribute('data-rise-motion', 'none')
		const { container } = setup({}, motionGlobal)
		await nextTick()
		await fireEvent.click(screen.getByRole('radio', { name: '2' }))
		await nextTick()
		expect(stages(container)).toHaveLength(1)
		expect(container.querySelector('.base-image-map__stage-leave-active')).toBeNull()
	})

	it('план того же размера сохраняет масштаб и положение; другого размера — масштаб сбрасывается', async () => {
		const { container } = setup()
		await nextTick()
		await fireEvent.click(screen.getByRole('button', { name: 'Увеличить' }))
		const zoomed = stageTransform(container)
		expect(zoomed).toContain('scale(1.5)')
		await fireEvent.click(screen.getByRole('radio', { name: '2' }))
		await nextTick()
		expect(stageTransform(container)).toBe(zoomed)
		await fireEvent.click(screen.getByRole('radio', { name: '3' }))
		await nextTick()
		expect(stageTransform(container)).toContain('scale(1)')
		expect(stages(container)[0]).not.toHaveClass('base-image-map__stage--animated')
	})
})
