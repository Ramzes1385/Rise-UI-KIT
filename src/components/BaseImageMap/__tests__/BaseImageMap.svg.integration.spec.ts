import '@testing-library/jest-dom/vitest'
import { defineComponent, h } from 'vue'
import BaseImageMap from '../ui/BaseImageMap.vue'
import { IMAGE_MAP_FLOORS } from '../stories/fixtures'
import type { ImageMapData } from '../types/imageMapData.types'
import { fireEvent, render, screen, waitFor } from '@testing-library/vue'

const PLAN =
	'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect id="room" width="50" height="50"/><rect id="hall" x="50" width="50" height="50"/></svg>'
const BASE_PROPS = { hasZoomControls: false, hasFullscreen: false }

function urlData(svgUrl: string, extraLayer = false): ImageMapData {
	return {
		layers: [
			{ id: 'remote', title: 'Удалённый план', svgUrl, width: 100, height: 100 },
			...(extraLayer ? [{ id: 'inline', title: 'Встроенный план', svg: PLAN, width: 100, height: 100 }] : []),
		],
		objects: [
			{ id: 'room', type: 'svg', elementId: 'room', title: 'Комната', layer: 'remote' },
			{ id: 'hall', type: 'svg', elementId: 'hall', title: 'Зал', layer: 'inline' },
		],
	}
}

function deferred<T>() {
	let resolve!: (value: T) => void
	let reject!: (reason: unknown) => void
	const promise = new Promise<T>((ok, fail) => {
		resolve = ok
		reject = fail
	})
	return { promise, resolve, reject }
}

const okResponse = (text: string) => ({ ok: true, text: async () => text }) as Response

describe('BaseImageMap svg — встроенный план', () => {
	it('объекты SVG получают роль, имя, tabindex, классы и стиль группы; id с префиксом', async () => {
		const { container } = render(BaseImageMap, { props: { data: IMAGE_MAP_FLOORS, ...BASE_PROPS } })
		const shop = await screen.findByRole('button', { name: 'Магазин 101' })
		expect(shop.tagName).toBe('rect')
		expect(shop).toHaveAttribute('data-image-map-object', 'f1-shop-1')
		expect(shop).toHaveAttribute('aria-haspopup', 'dialog')
		expect(shop).toHaveAttribute('tabindex', '0')
		expect(shop).toHaveClass('base-image-map__object', 'base-image-map__object--svg')
		expect(shop.style.getPropertyValue('--im-fill')).toBe('var(--rise-primary)')
		expect(shop.id).toMatch(/^rise-im-.+-f1-shop-1$/)
		expect(screen.getByRole('button', { name: 'Лестница' })).not.toHaveAttribute('aria-haspopup')
		expect(container.querySelector('.base-image-map__image')).toBeNull()
	})

	it('состояния объекта SVG обновляются: hover, active, затем снимаются', async () => {
		const { container, rerender } = render(BaseImageMap, { props: { data: IMAGE_MAP_FLOORS, ...BASE_PROPS } })
		const shop = await screen.findByRole('button', { name: 'Магазин 102' })
		await fireEvent.pointerOver(shop, { pointerType: 'mouse' })
		await waitFor(() => expect(shop).toHaveClass('base-image-map__object--hover'))
		await rerender({ data: IMAGE_MAP_FLOORS, ...BASE_PROPS, active: 'f1-shop-2' })
		await waitFor(() => expect(shop).toHaveAttribute('aria-current', 'true'))
		await rerender({ data: IMAGE_MAP_FLOORS, ...BASE_PROPS, active: null })
		await waitFor(() => expect(shop).not.toHaveAttribute('aria-current'))
		await fireEvent.pointerLeave(container.querySelector('.base-image-map__stage') as HTMLElement)
		await waitFor(() => expect(shop).not.toHaveClass('base-image-map__object--hover'))
	})

	it('два одинаковых плана в одном приложении не конфликтуют по id', async () => {
		render(
			defineComponent({
				setup: () => () => [
					h(BaseImageMap, { data: IMAGE_MAP_FLOORS, ...BASE_PROPS }),
					h(BaseImageMap, { data: IMAGE_MAP_FLOORS, ...BASE_PROPS }),
				],
			}),
		)
		const shops = await screen.findAllByRole('button', { name: 'Магазин 101' })
		expect(shops).toHaveLength(2)
		expect(shops[0].id).not.toBe(shops[1].id)
	})

	it('объект с несуществующим elementId просто не отрисовывается', async () => {
		const data: ImageMapData = {
			layers: [{ id: 'plan', title: 'План', svg: PLAN, width: 100, height: 100 }],
			objects: [
				{ id: 'room', type: 'svg', elementId: 'room', title: 'Комната' },
				{ id: 'ghost', type: 'svg', elementId: 'nope', title: 'Призрак' },
			],
		}
		render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		expect(await screen.findByRole('button', { name: 'Комната' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Призрак' })).toBeNull()
	})

	it('SVG слоя очищается: скрипты и обработчики не попадают в разметку', async () => {
		const unsafe =
			'<svg xmlns="http://www.w3.org/2000/svg"><script>window.hacked = 1</script><rect id="room" onclick="window.hacked = 1"/></svg>'
		const data: ImageMapData = {
			layers: [{ id: 'plan', title: 'План', svg: unsafe, width: 100, height: 100 }],
			objects: [{ id: 'room', type: 'svg', elementId: 'room', title: 'Комната' }],
		}
		const { container } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		const room = await screen.findByRole('button', { name: 'Комната' })
		expect(room).not.toHaveAttribute('onclick')
		expect(container.querySelector('script')).toBeNull()
	})

	it('невалидный встроенный SVG не рисует план и не показывает загрузку', () => {
		const data: ImageMapData = {
			layers: [{ id: 'plan', title: 'План', svg: '<svg><rect></svg>', width: 100, height: 100 }],
			objects: [],
		}
		const { container } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		expect(container.querySelector('.base-image-map__svg')).toBeNull()
		expect(screen.queryByRole('status')).toBeNull()
	})
})

describe('BaseImageMap svg — загрузка по svgUrl', () => {
	it('показывает статус загрузки, затем план', async () => {
		const response = deferred<Response>()
		const fetchMock = vi.fn(() => response.promise)
		vi.stubGlobal('fetch', fetchMock)
		render(BaseImageMap, { props: { data: urlData('/plan.svg'), ...BASE_PROPS } })
		expect(screen.getByRole('status')).toHaveTextContent('Загрузка карты…')
		expect(fetchMock).toHaveBeenCalledWith('/plan.svg')
		response.resolve(okResponse(PLAN))
		expect(await screen.findByRole('button', { name: 'Комната' })).toBeInTheDocument()
		expect(screen.queryByRole('status')).toBeNull()
		vi.unstubAllGlobals()
	})

	it('ответ с ошибкой, сетевая ошибка и пустой SVG — сообщение role=alert', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({ ok: false, text: async () => '' }) as Response),
		)
		const first = render(BaseImageMap, { props: { data: urlData('/404.svg'), ...BASE_PROPS } })
		expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить карту')
		first.unmount()
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => Promise.reject(new Error('offline'))),
		)
		const second = render(BaseImageMap, { props: { data: urlData('/offline.svg'), ...BASE_PROPS } })
		expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось загрузить карту')
		expect(screen.queryByRole('status')).toBeNull()
		second.unmount()
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => okResponse('<div/>')),
		)
		render(BaseImageMap, { props: { data: urlData('/bad.svg'), ...BASE_PROPS } })
		expect(await screen.findByRole('alert')).toBeInTheDocument()
		vi.unstubAllGlobals()
	})

	it('ответ устаревшего запроса после смены слоя игнорируется', async () => {
		const late = deferred<Response>()
		vi.stubGlobal(
			'fetch',
			vi.fn(() => late.promise),
		)
		const { rerender } = render(BaseImageMap, { props: { data: urlData('/slow.svg', true), ...BASE_PROPS } })
		await rerender({ data: urlData('/slow.svg', true), ...BASE_PROPS, layer: 'inline' })
		expect(await screen.findByRole('button', { name: 'Зал' })).toBeInTheDocument()
		late.resolve(okResponse('<svg xmlns="http://www.w3.org/2000/svg"><rect id="room"/></svg>'))
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(screen.getByRole('button', { name: 'Зал' })).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Комната' })).toBeNull()
		expect(screen.queryByRole('status')).toBeNull()
		vi.unstubAllGlobals()
	})

	it('ошибка устаревшего запроса после смены слоя не показывается', async () => {
		const late = deferred<Response>()
		vi.stubGlobal(
			'fetch',
			vi.fn(() => late.promise),
		)
		const { rerender } = render(BaseImageMap, { props: { data: urlData('/slow.svg', true), ...BASE_PROPS } })
		await rerender({ data: urlData('/slow.svg', true), ...BASE_PROPS, layer: 'inline' })
		late.reject(new Error('offline'))
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(screen.queryByRole('alert')).toBeNull()
		expect(await screen.findByRole('button', { name: 'Зал' })).toBeInTheDocument()
		vi.unstubAllGlobals()
	})

	it('слой без svg и svgUrl — без плана и без статуса', () => {
		const data: ImageMapData = { layers: [{ id: 'plain', title: 'Пусто', width: 10, height: 10 }], objects: [] }
		const { container } = render(BaseImageMap, { props: { data, ...BASE_PROPS } })
		expect(container.querySelector('.base-image-map__svg')).toBeNull()
		expect(screen.queryByRole('status')).toBeNull()
		expect(screen.queryByRole('alert')).toBeNull()
	})
})
