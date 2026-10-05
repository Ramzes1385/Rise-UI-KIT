import '@testing-library/jest-dom/vitest'
import { Vector3 } from 'three'
import type { VNode } from 'vue'
import BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import { defineComponent, h, nextTick, ref } from 'vue'
import type { ImageMap3DData } from '../types/imageMap3dData.types'
import type { Camera, Mesh, MeshStandardMaterial, Scene } from 'three'
import { createFakeRenderer, mockWebGL } from './imageMap3d.test-utils'
import type { BaseImageMap3DExpose } from '../types/BaseImageMap3D.types'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/vue'

const DATA: ImageMap3DData = {
	layers: [
		{ id: 'f1', title: 'Этаж 1', width: 800, height: 400 },
		{ id: 'f2', title: 'Этаж 2', width: 800, height: 400, elevation: 300 },
	],
	groups: [
		{ id: 'food', title: 'Еда' },
		{ id: 'shops', title: 'Магазины' },
	],
	filters: [{ id: 'kind', title: 'Тип' }],
	objects: [
		{ id: 'hall', type: 'rect', title: 'Зал', x: 0.3, y: 0.3, width: 0.4, height: 0.4, layer: 'f1', group: 'food', height3d: 30 },
		{ id: 'left', type: 'rect', title: 'Левый', x: 0.02, y: 0.4, width: 0.1, height: 0.2, layer: 'f1', group: 'shops' },
		{ id: 'kiosk', type: 'point', title: 'Киоск', x: 0.9, y: 0.5, layer: 'f1', label: 'K', group: 'food' },
		{ id: 'off', type: 'rect', title: 'Закрыто', x: 0.85, y: 0.05, width: 0.1, height: 0.1, layer: 'f1', isDisabled: true },
		{ id: 'roof', type: 'rect', title: 'Крыша', x: 0.3, y: 0.3, width: 0.4, height: 0.4, layer: 'f2' },
	],
}

class TestResizeObserver {
	observe = vi.fn()
	unobserve = vi.fn()
	disconnect = vi.fn()
}

let frames: FrameRequestCallback[] = []

function flushFrames(): void {
	const queue = frames
	frames = []
	queue.forEach(callback => callback(0))
}

const RECT = { left: 0, top: 0, right: 800, bottom: 400, width: 800, height: 400, x: 0, y: 0, toJSON: () => ({}) }

beforeEach(() => {
	frames = []
	vi.stubGlobal('ResizeObserver', TestResizeObserver)
	vi.stubGlobal(
		'requestAnimationFrame',
		vi.fn((callback: FrameRequestCallback) => frames.push(callback)),
	)
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
	vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800)
	vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400)
	vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue(RECT as DOMRect)
	document.documentElement.setAttribute('data-rise-motion', 'none')
	mockWebGL(true)
})

afterEach(() => {
	vi.restoreAllMocks()
	vi.unstubAllGlobals()
	document.documentElement.removeAttribute('data-rise-motion')
	window.history.replaceState(null, '', '/')
})

async function renderSelect(props: Record<string, unknown> = {}, slots: Record<string, () => VNode> = {}) {
	const renderer = createFakeRenderer()
	const exposed = ref<BaseImageMap3DExpose | null>(null)
	const Host = defineComponent({
		setup:
			(_, { attrs }) =>
			() =>
				h(BaseImageMap3D, { data: DATA, rendererFactory: () => renderer, ...attrs, ref: exposed }, slots),
	})
	const result = render(Host, { attrs: props })
	await waitFor(() => expect(renderer.setPixelRatio).toHaveBeenCalled())
	await nextTick()
	flushFrames()
	const camera = (): Camera => renderer.render.mock.calls.at(-1)?.[1] as Camera
	const scene = (): Scene => renderer.render.mock.calls.at(-1)?.[0] as Scene
	const screenOf = (world: Vector3) => {
		const ndc = world.clone().project(camera())
		return { clientX: ((ndc.x + 1) / 2) * 800, clientY: ((1 - ndc.y) / 2) * 400 }
	}
	const region = () => screen.getByRole('group', { name: /Этаж/ })
	const material = (name: string) => (scene().getObjectByName(name) as Mesh<never, MeshStandardMaterial>).material
	return { ...result, renderer, exposed, camera, scene, screenOf, region, material }
}

const HALL = new Vector3(400, 15, 200)
const LEFT = new Vector3(56, 5, 200)

describe('BaseImageMap3D: выбор объектов', () => {
	it('клик по объекту — select, v-model:active и окно; повторный выбор того же — без update:active', async () => {
		const onSelect = vi.fn()
		const onUpdateActive = vi.fn()
		const { region, screenOf, material } = await renderSelect({ onSelect, 'onUpdate:active': onUpdateActive })
		const point = screenOf(HALL)
		await fireEvent.pointerDown(region(), point)
		await fireEvent.click(region(), point)
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'hall' }))
		expect(onUpdateActive).toHaveBeenCalledWith('hall')
		expect(await screen.findByRole('dialog', { name: 'Зал' })).toBeInTheDocument()
		flushFrames()
		expect(material('hall').opacity).toBe(1)
		await fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
		await fireEvent.click(region(), screenOf(HALL))
		expect(onUpdateActive).toHaveBeenCalledTimes(1)
	})

	it('после перетаскивания больше 4 px клик не выбирает; до 4 px — выбирает; пустое место — ничего', async () => {
		const onSelect = vi.fn()
		const { region, screenOf } = await renderSelect({ onSelect, defaultAction: 'none' })
		const point = screenOf(LEFT)
		await fireEvent.pointerDown(region(), point)
		await fireEvent.click(region(), { clientX: point.clientX + 10, clientY: point.clientY })
		expect(onSelect).not.toHaveBeenCalled()
		await fireEvent.pointerDown(region(), point)
		await fireEvent.click(region(), { clientX: point.clientX + 3, clientY: point.clientY })
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'left' }))
		await fireEvent.click(region(), { clientX: 790, clientY: 395 })
		expect(onSelect).toHaveBeenCalledTimes(1)
	})

	it('наведение: событие hover, подсветка, карточка у объекта; уход указателя и касание — без карточки', async () => {
		const onHover = vi.fn()
		const { region, screenOf, material } = await renderSelect({ onHover })
		const base = material('hall').opacity
		await fireEvent.pointerMove(region(), { ...screenOf(HALL), pointerType: 'mouse' })
		expect(onHover).toHaveBeenLastCalledWith(expect.objectContaining({ id: 'hall' }))
		await nextTick()
		const card = region().querySelector('[role="tooltip"]') as HTMLElement
		expect(card).toHaveTextContent('Зал')
		expect(card).toHaveClass('base-image-map-3d__card--pending')
		flushFrames()
		await nextTick()
		expect(card).not.toHaveClass('base-image-map-3d__card--pending')
		expect(screen.getByRole('tooltip')).toBe(card)
		expect(card.style.left).not.toBe('')
		expect(region()).toHaveAttribute('aria-describedby', expect.stringContaining(card.id))
		expect(material('hall').opacity).toBeGreaterThan(base)
		await fireEvent.pointerMove(region(), { ...screenOf(HALL), pointerType: 'mouse', buttons: 1 })
		await fireEvent.pointerLeave(region())
		expect(onHover).toHaveBeenLastCalledWith(null)
		expect(screen.queryByRole('tooltip')).toBeNull()
		await fireEvent.pointerMove(region(), { ...screenOf(HALL), pointerType: 'touch' })
		expect(onHover).toHaveBeenCalledTimes(2)
	})

	it('метки point над сценой: подпись, выбор щелчком, слот point', async () => {
		const onSelect = vi.fn()
		const { container } = await renderSelect({ onSelect, defaultAction: 'none' }, { point: () => h('b', '●') })
		await nextTick()
		const marker = container.querySelector('[data-image-map-object="kiosk"]') as HTMLElement
		expect(marker).toHaveTextContent('●K')
		expect(marker.style.left).toMatch(/px$/)
		await fireEvent.click(marker)
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'kiosk' }))
		await nextTick()
		flushFrames()
		await nextTick()
		expect(container.querySelector('[data-image-map-object="kiosk"]')).toHaveClass('base-image-map-3d__point--active')
	})

	it('карточка точки и подсказка из слота; без hasTooltip — без карточки', async () => {
		const { region, container, unmount } = await renderSelect({}, { tooltip: () => h('span', 'из слота') })
		const marker = container.querySelector('[data-image-map-object="kiosk"]') as HTMLElement
		await fireEvent.pointerMove(marker, { pointerType: 'mouse' })
		expect(await within(region()).findByText('из слота')).toBeInTheDocument()
		unmount()
		const next = await renderSelect({ hasTooltip: false })
		await fireEvent.pointerMove(next.region(), { ...next.screenOf(HALL), pointerType: 'mouse' })
		expect(screen.queryByRole('tooltip')).toBeNull()
	})

	it('v-model:active и фильтры: выбранный объект ярче, скрытые фильтром не рисуются и не выбираются', async () => {
		const onSelect = vi.fn()
		const { scene, region, screenOf } = await renderSelect({ active: 'left', filters: { kind: ['food'] }, onSelect })
		flushFrames()
		expect(scene().getObjectByName('left')?.visible).toBe(false)
		expect(scene().getObjectByName('hall')?.visible).toBe(true)
		await fireEvent.click(region(), screenOf(LEFT))
		expect(onSelect).not.toHaveBeenCalled()
	})

	it('zoomToObject показывает этаж объекта; hasZoomToActive — камера к выбранному', async () => {
		const onLayerChange = vi.fn()
		const { exposed, region, screenOf, camera } = await renderSelect({ hasZoomToActive: true, onLayerChange, defaultAction: 'none' })
		const before = camera().position.clone()
		await fireEvent.click(region(), screenOf(HALL))
		await nextTick()
		await nextTick()
		flushFrames()
		expect(camera().position.equals(before)).toBe(false)
		exposed.value?.zoomToObject('roof')
		expect(onLayerChange).toHaveBeenCalledWith('f2')
	})
})

describe('BaseImageMap3D: клавиатура', () => {
	it('стрелки — между объектами по расположению, Enter — открыть, Escape — снять; aria-live объявляет объект', async () => {
		const onSelect = vi.fn()
		const { region } = await renderSelect({ onSelect, defaultAction: 'none' })
		region().focus()
		await fireEvent.keyDown(region(), { key: 'ArrowRight' })
		const live = region().querySelector('[aria-live="polite"]') as HTMLElement
		expect(live).toHaveTextContent('Зал, Этаж 1')
		await nextTick()
		expect(region().querySelector('[role="tooltip"]')).toHaveTextContent('Зал')
		await fireEvent.keyDown(region(), { key: 'ArrowLeft' })
		expect(live).toHaveTextContent('Левый, Этаж 1')
		await fireEvent.keyDown(region(), { key: 'ArrowLeft' })
		expect(live).toHaveTextContent('Левый, Этаж 1')
		await fireEvent.keyDown(region(), { key: 'End' })
		expect(live).toHaveTextContent('Киоск, Этаж 1')
		await fireEvent.keyDown(region(), { key: 'Home' })
		expect(live).toHaveTextContent('Зал, Этаж 1')
		await fireEvent.keyDown(region(), { key: 'Enter' })
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'hall' }))
		await fireEvent.keyDown(region(), { key: 'Escape' })
		expect(live).toHaveTextContent('')
		expect(screen.queryByRole('tooltip')).toBeNull()
		const escape = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true })
		region().dispatchEvent(escape)
		expect(escape.defaultPrevented).toBe(false)
		const ctrl = new KeyboardEvent('keydown', { key: 'ArrowLeft', ctrlKey: true, bubbles: true, cancelable: true })
		region().dispatchEvent(ctrl)
		expect(ctrl.defaultPrevented).toBe(false)
	})

	it('первая стрелка — выбранный объект; Space — открыть окно', async () => {
		const { region } = await renderSelect({ active: 'left' })
		await fireEvent.keyDown(region(), { key: 'ArrowDown' })
		expect(region().querySelector('[aria-live="polite"]')).toHaveTextContent('Левый, Этаж 1')
		await fireEvent.keyDown(region(), { key: ' ' })
		expect(await screen.findByRole('dialog', { name: 'Левый' })).toBeInTheDocument()
	})

	it('PageUp и PageDown — этажи с объявлением; на крайнем этаже — ничего; этаж без объектов — стрелки не перехватываются', async () => {
		const onLayerChange = vi.fn()
		const { region } = await renderSelect({ onLayerChange, filters: { kind: ['nothing'] } })
		await fireEvent.keyDown(region(), { key: 'PageDown' })
		expect(onLayerChange).not.toHaveBeenCalled()
		await fireEvent.keyDown(region(), { key: 'PageUp' })
		expect(onLayerChange).toHaveBeenCalledWith('f2')
		await nextTick()
		expect(region().querySelector('[aria-live="polite"]')).toHaveTextContent('Показан этаж: Этаж 2')
		await fireEvent.keyDown(region(), { key: 'PageUp' })
		expect(onLayerChange).toHaveBeenCalledTimes(1)
		await fireEvent.keyDown(region(), { key: 'PageDown' })
		expect(onLayerChange).toHaveBeenLastCalledWith('f1')
		const arrow = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true })
		region().dispatchEvent(arrow)
		expect(arrow.defaultPrevented).toBe(false)
	})

	it('подсказка области называет клавиши объектов', async () => {
		const { region } = await renderSelect()
		expect(region()).toHaveAccessibleDescription(expect.stringContaining('Стрелки — объекты, Enter — открыть'))
	})
})

describe('BaseImageMap3D: каталог и deep link', () => {
	it('каталог рядом со сценой: строка выбирает объект, наведение на строку показывает карточку', async () => {
		const onSelect = vi.fn()
		const { container } = await renderSelect({ hasDirectory: true, onSelect, defaultAction: 'none' })
		expect(container.querySelector('.base-image-map-3d__directory')).toBeInTheDocument()
		const row = screen.getByRole('button', { name: /Левый/ })
		await fireEvent.pointerEnter(row)
		await nextTick()
		expect(container.querySelector('[role="tooltip"]')).toHaveTextContent('Левый')
		await fireEvent.pointerLeave(row)
		await fireEvent.click(row)
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'left' }))
		const search = screen.getByRole('textbox', { name: 'Поиск по карте' })
		await fireEvent.update(search, 'Киоск')
		expect(screen.queryByRole('button', { name: /Левый/ })).toBeNull()
	})

	it('слоты строки и пустого каталога', async () => {
		await renderSelect(
			{ hasDirectory: true, search: 'нет такого' },
			{ 'directory-item': () => h('span', 'строка'), 'directory-empty': () => h('i', 'Пусто') },
		)
		expect(screen.getByText('Пусто')).toBeInTheDocument()
		await fireEvent.update(screen.getByRole('textbox', { name: 'Поиск по карте' }), '')
		expect(screen.getAllByText('строка').length).toBeGreaterThan(0)
	})

	it('?location= открывает объект и пишет выбранный в адрес', async () => {
		window.history.replaceState(null, '', '/?location=hall')
		await renderSelect({ hasDeepLinking: true })
		expect(await screen.findByRole('dialog', { name: 'Зал' })).toBeInTheDocument()
		expect(window.location.search).toBe('?location=hall')
	})
})

describe('BaseImageMap3D: переключатель 3D / 2D', () => {
	it('2D-вид сохраняет выбранный объект и этаж; выбор в 2D возвращается в 3D', async () => {
		const onUpdateView = vi.fn()
		const onUpdateActive = vi.fn()
		const onLayerChange = vi.fn()
		const { container } = await renderSelect({
			has2dToggle: true,
			active: 'hall',
			'onUpdate:view': onUpdateView,
			'onUpdate:active': onUpdateActive,
			onLayerChange,
		})
		const views = screen.getByRole('radiogroup', { name: 'Вид карты' })
		await fireEvent.click(within(views).getByRole('radio', { name: '2D' }))
		expect(onUpdateView).toHaveBeenCalledWith('2d')
		const map = container.querySelector('.base-image-map') as HTMLElement
		expect(map.querySelector('[data-image-map-object="hall"]')).toHaveClass('base-image-map__object--active')
		await fireEvent.click(within(map).getByRole('button', { name: 'Левый' }))
		expect(onUpdateActive).toHaveBeenCalledWith('left')
		await fireEvent.click(within(map).getByRole('radio', { name: 'Этаж 2' }))
		expect(onLayerChange).toHaveBeenCalledTimes(1)
		await fireEvent.click(within(views).getByRole('radio', { name: '3D' }))
		expect(onUpdateView).toHaveBeenLastCalledWith('3d')
		expect(screen.getByRole('radiogroup', { name: 'Этажи' })).toBeInTheDocument()
		expect(within(screen.getByRole('radiogroup', { name: 'Этажи' })).getByRole('radio', { name: 'Этаж 2' })).toBeChecked()
	})

	it('поиск, фильтры и маршрут из 2D-вида сохраняются', async () => {
		const onUpdateSearch = vi.fn()
		const onUpdateFilters = vi.fn()
		const onUpdateRoute = vi.fn()
		const { exposed } = await renderSelect({
			hasDirectory: true,
			'onUpdate:search': onUpdateSearch,
			'onUpdate:filters': onUpdateFilters,
			'onUpdate:route': onUpdateRoute,
		})
		exposed.value?.setView('2d')
		await nextTick()
		await fireEvent.update(screen.getByRole('textbox', { name: 'Поиск по карте' }), 'Зал')
		expect(onUpdateSearch).toHaveBeenCalledWith('Зал')
		await fireEvent.click(screen.getByRole('checkbox', { name: 'Еда' }))
		expect(onUpdateFilters).toHaveBeenCalledWith({ kind: ['food'] })
		exposed.value?.showRoute('hall', 'left')
		expect(onUpdateRoute).toHaveBeenCalledWith(expect.objectContaining({ from: 'hall', to: 'left' }))
		exposed.value?.setView('3d')
		await nextTick()
		expect(screen.getByRole('textbox', { name: 'Поиск по карте' })).toHaveValue('Зал')
		exposed.value?.clearFilters()
		await nextTick()
		expect(screen.getByRole('textbox', { name: 'Поиск по карте' })).toHaveValue('')
	})
})

describe('BaseImageMap3D: переход в 2D (замечания проверки части 1)', () => {
	it('view="2d" без WebGL — без статуса и без события fallback; переход в 3D — статус и unsupported', async () => {
		mockWebGL(false)
		const onFallback = vi.fn()
		const { rerender, container } = render(BaseImageMap3D, { props: { data: DATA, view: '2d', onFallback } })
		await nextTick()
		expect(container.querySelector('.base-image-map-3d__status')).toHaveTextContent('')
		expect(onFallback).not.toHaveBeenCalled()
		await rerender({ view: '3d' })
		expect(onFallback).toHaveBeenCalledWith('unsupported')
		expect(container.querySelector('.base-image-map-3d__status')).toHaveTextContent('Браузер не поддерживает 3D')
	})

	it('view="2d" с WebGL — без статуса и без события; переключателя без WebGL нет', async () => {
		const onFallback = vi.fn()
		const { container, unmount } = render(BaseImageMap3D, { props: { data: DATA, view: '2d', onFallback, has2dToggle: true } })
		await nextTick()
		expect(onFallback).not.toHaveBeenCalled()
		expect(container.querySelector('.base-image-map-3d__status')).toHaveTextContent('')
		expect(screen.getByRole('radiogroup', { name: 'Вид карты' })).toBeInTheDocument()
		unmount()
		mockWebGL(false)
		render(BaseImageMap3D, { props: { data: DATA, has2dToggle: true } })
		await nextTick()
		expect(screen.queryByRole('radiogroup', { name: 'Вид карты' })).toBeNull()
	})

	it('ошибка рендерера: 2D и fallback("error"); возврат в 3D пробует снова', async () => {
		const renderer = createFakeRenderer()
		const factory = vi
			.fn()
			.mockImplementationOnce(() => {
				throw new Error('no context')
			})
			.mockImplementationOnce(() => {
				throw new Error('no context')
			})
			.mockImplementation(() => renderer)
		const onFallback = vi.fn()
		const exposed = ref<BaseImageMap3DExpose | null>(null)
		const Host = defineComponent({
			setup: () => () => h(BaseImageMap3D, { data: DATA, rendererFactory: factory, onFallback, ref: exposed }),
		})
		const { container } = render(Host)
		await waitFor(() => expect(onFallback).toHaveBeenCalledWith('error'))
		expect(container.querySelector('.base-image-map')).toBeInTheDocument()
		exposed.value?.setView('3d')
		await waitFor(() => expect(factory).toHaveBeenCalledTimes(2))
		await waitFor(() => expect(onFallback).toHaveBeenCalledTimes(2))
		exposed.value?.setView('2d')
		await nextTick()
		exposed.value?.setView('3d')
		await waitFor(() => expect(factory).toHaveBeenCalledTimes(3))
		await waitFor(() => expect(container.querySelector('.base-image-map-3d__viewport')).toBeInTheDocument())
		expect(container.querySelector('.base-image-map-3d__status')).toHaveTextContent('')
	})
})
