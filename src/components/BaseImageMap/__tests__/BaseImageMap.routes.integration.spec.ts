import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import BaseImageMap from '../ui/BaseImageMap.vue'
import userEvent from '@testing-library/user-event'
import type { ImageMapData } from '../types/imageMapData.types'
import { IMAGE_MAP_MALL_ROUTES } from '../stories/routesFixtures'
import type { BaseImageMapExpose } from '../types/BaseImageMap.types'
import { render, screen, waitFor, within } from '@testing-library/vue'
import type { ImageMapRouteResult, ImageMapRouteValue } from '../types/ImageMapRoutes.types'

const data = IMAGE_MAP_MALL_ROUTES
const BASE_PROPS = { data, hasRoutes: true, hasZoomControls: false, hasFullscreen: false }
const TO_CINEMA: ImageMapRouteValue = { from: 'f1-shop-1', to: 'f3-shop-1' }

function panel(): HTMLElement {
	return screen.getByRole('region', { name: 'Как пройти' })
}

function steps(): string[] {
	return within(panel())
		.queryAllByRole('listitem')
		.map(item => item.textContent?.replace(/\s+/g, ' ').trim() ?? '')
}

function routeChanges(emitted: Record<string, unknown[]>): (ImageMapRouteResult | null)[] {
	return (emitted['route-change'] ?? []).map(args => (args as [ImageMapRouteResult | null])[0])
}

describe('BaseImageMap integration — маршруты', () => {
	it('без запроса панель пустая, линии нет, route-change не приходит', () => {
		const { container, emitted } = render(BaseImageMap, { props: BASE_PROPS })
		expect(within(panel()).getByRole('status')).toHaveTextContent('')
		expect(within(panel()).queryByRole('list')).toBeNull()
		expect(container.querySelector('.base-image-map__route-layer')).toBeNull()
		expect(emitted()['route-change']).toBeUndefined()
	})

	it('маршрут из v-model:route: итог, шаги списком, линия и метки текущего этажа, этаж начала', async () => {
		const { container, emitted } = render(BaseImageMap, { props: { ...BASE_PROPS, layer: 'floor-2', route: TO_CINEMA } })
		expect(within(panel()).getByRole('status')).toHaveTextContent(/^Маршрут от «Кофейня» до «Кино», около \d+ м$/)
		expect(within(panel()).getByRole('list', { name: 'Шаги маршрута' })).toBeInTheDocument()
		expect(steps()).toEqual([
			'Начните у «Кофейня» (1 этаж)',
			expect.stringMatching(/^Идите к лестнице «Лестница у входа», ≈ \d+ м$/),
			'Поднимитесь по лестнице: 3 этаж',
			expect.stringMatching(/^Идите к «Кино», ≈ \d+ м$/),
		])
		const [result] = routeChanges(emitted())
		expect(result?.from.id).toBe('f1-shop-1')
		expect(result?.to.id).toBe('f3-shop-1')
		expect(result?.meters).toBeGreaterThan(0)
		expect(emitted()['update:layer']).toEqual([['floor-1']])
		await waitFor(() => expect(container.querySelectorAll('.base-image-map__route-path')).toHaveLength(1))
		expect(container.querySelector('.base-image-map__route-layer')).toHaveAttribute('aria-hidden', 'true')
		expect(container.querySelector('.base-image-map__route-marker--start')).toBeInTheDocument()
		expect(container.querySelector('.base-image-map__route-marker--transition')).toBeInTheDocument()
	})

	it('выбор шага показывает его этаж', async () => {
		const user = userEvent.setup()
		const { container, emitted } = render(BaseImageMap, { props: { ...BASE_PROPS, route: TO_CINEMA } })
		await user.click(within(panel()).getByRole('button', { name: /Поднимитесь по лестнице/ }))
		expect(emitted()['update:layer']).toEqual([['floor-1'], ['floor-3']])
		await waitFor(() => expect(container.querySelector('.base-image-map__route-marker--end')).toBeInTheDocument())
	})

	it('откуда и куда выбираются с клавиатуры', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageMap, { props: BASE_PROPS })
		within(panel()).getByRole('combobox', { name: 'Откуда' }).focus()
		await user.keyboard('{ArrowDown}')
		await user.keyboard('Кофе')
		await user.keyboard('{Enter}')
		expect(emitted()['update:route']).toEqual([[{ from: 'f1-shop-1', to: null, isStepFree: false }]])
		within(panel()).getByRole('combobox', { name: 'Куда' }).focus()
		await user.keyboard('{ArrowDown}')
		await user.keyboard('Обувь')
		await user.keyboard('{Enter}')
		expect(emitted()['update:route']?.[1]).toEqual([{ from: 'f1-shop-1', to: 'f2-shop-2', isStepFree: false }])
		expect(within(panel()).getByRole('status')).toHaveTextContent('Маршрут от «Кофейня» до «Обувь»')
		expect(steps()[2]).toBe('Поднимитесь на эскалаторе: 2 этаж')
	})

	it('варианты — объекты с этажом, по алфавиту', async () => {
		const user = userEvent.setup()
		render(BaseImageMap, { props: BASE_PROPS })
		await user.click(within(panel()).getByRole('combobox', { name: 'Откуда' }))
		const options = screen.getAllByRole('option').map(option => option.textContent?.trim())
		expect(options[0]).toBe('Аптека · 1')
		expect(options).toHaveLength(12)
	})

	it('на одном слое варианты без этажа; недоступные и скрытые из списка объекты не предлагаются', async () => {
		const user = userEvent.setup()
		const single: ImageMapData = {
			layers: [{ id: 'hall', title: 'Зал', width: 100, height: 100 }],
			objects: [
				{ id: 'a', type: 'point', title: 'Вход', x: 0.1, y: 0.1 },
				{ id: 'b', type: 'point', title: 'Касса', x: 0.9, y: 0.1, isDisabled: true },
				{ id: 'c', type: 'point', title: 'Лестница', x: 0.5, y: 0.5, isHiddenInDirectory: true },
			],
			routes: { nodes: [{ id: 'n', x: 0.1, y: 0.1 }], edges: [] },
		}
		render(BaseImageMap, { props: { ...BASE_PROPS, data: single } })
		await user.click(within(panel()).getByRole('combobox', { name: 'Куда' }))
		expect(screen.getAllByRole('option').map(option => option.textContent?.trim())).toEqual(['Вход'])
		expect(within(panel()).queryByRole('switch')).toBeNull()
	})

	it('поменять местами, «Без лестниц» и сброс меняют запрос', async () => {
		const user = userEvent.setup()
		const { emitted } = render(BaseImageMap, { props: { ...BASE_PROPS, route: TO_CINEMA } })
		await user.click(within(panel()).getByRole('button', { name: 'Поменять местами' }))
		expect(emitted()['update:route']?.[0]).toEqual([{ from: 'f3-shop-1', to: 'f1-shop-1' }])
		expect(steps()[2]).toBe('Спуститесь по лестнице: 1 этаж')
		await user.click(within(panel()).getByRole('switch', { name: 'Без лестниц' }))
		expect(emitted()['update:route']?.[1]).toEqual([{ from: 'f3-shop-1', to: 'f1-shop-1', isStepFree: true }])
		expect(steps()[1]).toMatch(/^Идите к лифту «Лифт»/)
		await user.click(within(panel()).getByRole('button', { name: 'Сбросить маршрут' }))
		expect(emitted()['update:route']?.[2]).toEqual([{ from: null, to: null, isStepFree: true }])
		expect(routeChanges(emitted()).at(-1)).toBeNull()
		expect(within(panel()).getByRole('button', { name: 'Поменять местами' })).toBeDisabled()
		expect(within(panel()).queryByRole('button', { name: 'Сбросить маршрут' })).toBeNull()
	})

	it('недостижимый объект — «не найден», без шагов и линии', () => {
		const { container, emitted } = render(BaseImageMap, {
			props: { ...BASE_PROPS, route: { from: 'f1-shop-1', to: 'f3-shop-4' } },
		})
		const status = within(panel()).getByRole('status')
		expect(status).toHaveTextContent('Маршрут от «Кофейня» до «Служебное помещение» не найден')
		expect(status).toHaveClass('base-image-map__route-summary--error')
		expect(within(panel()).queryByRole('list')).toBeNull()
		expect(container.querySelector('.base-image-map__route-layer')).toBeNull()
		expect(routeChanges(emitted())).toEqual([null])
	})

	it('без metersPerWidth — итог без метров; одинаковые «откуда» и «куда» — без маршрута', async () => {
		const routes = { ...data.routes!, metersPerWidth: undefined }
		const { rerender } = render(BaseImageMap, { props: { ...BASE_PROPS, data: { ...data, routes }, route: TO_CINEMA } })
		expect(within(panel()).getByRole('status')).toHaveTextContent(/^Маршрут от «Кофейня» до «Кино»$/)
		await rerender({ route: { from: 'f1-shop-1', to: 'f1-shop-1' } })
		expect(within(panel()).getByRole('status')).toHaveTextContent('')
		await rerender({ route: null })
		expect(within(panel()).queryByRole('button', { name: 'Сбросить маршрут' })).toBeNull()
	})

	it('линия рисуется и без панели; без data.routes панели нет', () => {
		const { container, unmount } = render(BaseImageMap, { props: { ...BASE_PROPS, hasRoutes: false, route: TO_CINEMA } })
		expect(screen.queryByRole('region', { name: 'Как пройти' })).toBeNull()
		expect(container.querySelector('.base-image-map__route-layer')).toBeInTheDocument()
		unmount()
		render(BaseImageMap, { props: { ...BASE_PROPS, data: { ...data, routes: undefined }, route: TO_CINEMA } })
		expect(screen.queryByRole('region', { name: 'Как пройти' })).toBeNull()
	})

	it('без переходов без ступеней переключателя «Без лестниц» нет; customClass.route — на панели', () => {
		const routes = { ...data.routes!, transitions: data.routes!.transitions!.filter(item => item.type === 'stairs') }
		render(BaseImageMap, { props: { ...BASE_PROPS, data: { ...data, routes }, customClass: { route: 'my-route' } } })
		expect(within(panel()).queryByRole('switch')).toBeNull()
		expect(panel()).toHaveClass('my-route')
	})

	it('методы showRoute и clearRoute', async () => {
		const mapRef = ref<BaseImageMapExpose | null>(null)
		const { emitted } = render(
			{
				components: { BaseImageMap },
				setup: () => ({ mapRef, props: BASE_PROPS }),
				template: '<BaseImageMap ref="mapRef" v-bind="props" />',
			},
			{},
		)
		mapRef.value?.showRoute('f2-shop-1', 'f1-shop-2')
		await waitFor(() => expect(within(panel()).getByRole('status')).toHaveTextContent('Маршрут от «Одежда» до «Аптека»'))
		mapRef.value?.clearRoute()
		await waitFor(() => expect(within(panel()).getByRole('status')).toHaveTextContent(''))
		expect(emitted()).toBeDefined()
	})
})
