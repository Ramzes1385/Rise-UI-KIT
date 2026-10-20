import { defineComponent, h } from 'vue'
import { render } from '@testing-library/vue'
import { useScenePinch } from '../../input/useScenePinch'
import { useScenePointer } from '../../input/useScenePointer'
import type { Scene3DPointerOptions } from '../../types/internal/scene3dInternal.types'

let frames: Map<number, FrameRequestCallback>
let nextId: number

const flush = () => {
	const due = [...frames.values()]
	frames.clear()
	due.forEach(callback => callback(0))
}

beforeEach(() => {
	frames = new Map()
	nextId = 0
	vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
		nextId += 1
		frames.set(nextId, callback)
		return nextId
	})
	vi.stubGlobal('cancelAnimationFrame', (id: number) => void frames.delete(id))
})

afterEach(() => vi.unstubAllGlobals())

function mount(overrides: Partial<Scene3DPointerOptions> = {}) {
	const options = { pickAt: vi.fn(() => 'ray'), setHover: vi.fn(), activate: vi.fn(), ...overrides }
	let api!: ReturnType<typeof useScenePointer>
	const view = render(
		defineComponent({
			setup() {
				api = useScenePointer(options)
				return () => h('div')
			},
		}),
	)
	return { api, options, view }
}

const move = (x: number, y: number, extra: Partial<PointerEvent> = {}) =>
	({ clientX: x, clientY: y, pointerType: 'mouse', buttons: 0, target: null, ...extra }) as PointerEvent
const click = (x: number, y: number, target: EventTarget | null = null) => ({ clientX: x, clientY: y, target }) as unknown as MouseEvent

describe('useScenePointer: наведение', () => {
	it('считается раз в кадр по последнему положению', () => {
		const { api, options } = mount()
		api.onPointerMove(move(1, 1))
		api.onPointerMove(move(2, 3))
		expect(frames.size).toBe(1)
		expect(options.pickAt).not.toHaveBeenCalled()
		flush()
		expect(options.pickAt).toHaveBeenCalledExactlyOnceWith(2, 3)
		expect(options.setHover).toHaveBeenCalledWith('ray')
	})

	it('тач и нажатая кнопка наведения не считают', () => {
		const { api } = mount()
		api.onPointerMove(move(1, 1, { pointerType: 'touch' }))
		api.onPointerMove(move(1, 1, { buttons: 1 }))
		expect(frames.size).toBe(0)
	})

	it('markerAt важнее луча; пусто от markerAt — идём лучом', () => {
		const target = document.createElement('i')
		const markerAt = vi.fn((_: EventTarget | null) => 'marker' as string | null)
		const { api, options } = mount({ markerAt })
		api.onPointerMove(move(1, 1, { target } as never))
		flush()
		expect(markerAt).toHaveBeenCalledWith(target)
		expect(options.setHover).toHaveBeenLastCalledWith('marker')
		expect(options.pickAt).not.toHaveBeenCalled()
		markerAt.mockReturnValue(null)
		api.onPointerMove(move(1, 1))
		flush()
		expect(options.setHover).toHaveBeenLastCalledWith('ray')
	})

	it('уход указателя отменяет кадр и сбрасывает наведение', () => {
		const { api, options } = mount()
		api.onPointerMove(move(1, 1))
		api.onPointerLeave()
		expect(frames.size).toBe(0)
		expect(options.setHover).toHaveBeenCalledExactlyOnceWith(null)
		flush()
		expect(options.setHover).toHaveBeenCalledTimes(1)
	})

	it('кадр, который отмена не остановила, наведение уже сброшенной точки не считает', () => {
		vi.stubGlobal('cancelAnimationFrame', () => undefined)
		const { api, options } = mount()
		api.onPointerMove(move(1, 1))
		api.onPointerLeave()
		flush()
		expect(options.pickAt).not.toHaveBeenCalled()
		expect(options.setHover).toHaveBeenCalledExactlyOnceWith(null)
	})

	it('размонтирование отменяет ожидающий кадр', () => {
		const { api, options, view } = mount()
		api.onPointerMove(move(1, 1))
		view.unmount()
		expect(frames.size).toBe(0)
		expect(options.setHover).not.toHaveBeenCalled()
	})

	it('уход без ожидающего кадра не падает', () => {
		const { api } = mount()
		expect(() => api.onPointerLeave()).not.toThrow()
	})
})

describe('useScenePointer: клик', () => {
	it('выбирает объект под точкой клика', () => {
		const { api, options } = mount()
		const event = click(10, 10)
		api.onPointerDown(move(10, 10))
		api.onClick(event)
		expect(options.pickAt).toHaveBeenCalledWith(10, 10)
		expect(options.activate).toHaveBeenCalledWith('ray', event)
	})

	it('смещение до 4 px — клик, больше — перетаскивание, выбора нет', () => {
		const { api, options } = mount()
		api.onPointerDown(move(0, 0))
		api.onClick(click(3, 0))
		expect(options.activate).toHaveBeenCalledTimes(1)
		api.onPointerDown(move(0, 0))
		api.onClick(click(5, 0))
		expect(options.activate).toHaveBeenCalledTimes(1)
	})

	it('клик без нажатия (клавиатура, сброшенное начало) тоже выбирает; начало забывается после клика', () => {
		const { api, options } = mount()
		api.onPointerDown(move(0, 0))
		api.onClick(click(0, 0))
		api.onClick(click(100, 100))
		expect(options.activate).toHaveBeenCalledTimes(2)
	})

	it('в пустоту — не выбирает; метка выбирается через markerAt', () => {
		const { api, options } = mount({ pickAt: vi.fn(() => null) })
		api.onClick(click(1, 1))
		expect(options.activate).not.toHaveBeenCalled()
		const marker = mount({ markerAt: () => 'm' })
		const target = document.createElement('i')
		marker.api.onClick(click(1, 1, target))
		expect(marker.options.activate).toHaveBeenCalledWith('m', expect.anything())
	})
})

describe('useScenePinch', () => {
	const pointer = (pointerType: string, id: number, at: { x: number; y: number }) =>
		({ pointerId: id, clientX: at.x, clientY: at.y, pointerType }) as PointerEvent
	const touch = (id: number, x: number, y: number) => pointer('touch', id, { x, y })
	const mouse = (id: number, x: number, y: number) => pointer('mouse', id, { x, y })

	it('два пальца: коэффициент — отношение расстояний', () => {
		const zoomBy = vi.fn()
		const pinch = useScenePinch(zoomBy)
		pinch.onPointerDown(touch(1, 0, 0))
		pinch.onPointerDown(touch(2, 10, 0))
		pinch.onPointerMove(touch(2, 20, 0))
		expect(zoomBy).toHaveBeenCalledExactlyOnceWith(2)
		pinch.onPointerMove(touch(2, 10, 0))
		expect(zoomBy).toHaveBeenLastCalledWith(0.5)
	})

	it('мышь, один палец и чужой указатель не масштабируют', () => {
		const zoomBy = vi.fn()
		const pinch = useScenePinch(zoomBy)
		pinch.onPointerDown(mouse(1, 0, 0))
		pinch.onPointerMove(mouse(1, 5, 5))
		pinch.onPointerDown(touch(2, 0, 0))
		pinch.onPointerMove(touch(2, 10, 0))
		pinch.onPointerMove(touch(9, 10, 0))
		expect(zoomBy).not.toHaveBeenCalled()
	})

	it('палец убран — измерение начинается заново; сведённые пальцы (расстояние < 1) не масштабируют', () => {
		const zoomBy = vi.fn()
		const pinch = useScenePinch(zoomBy)
		pinch.onPointerDown(touch(1, 0, 0))
		pinch.onPointerDown(touch(2, 10, 0))
		pinch.onPointerUp(touch(2, 10, 0))
		pinch.onPointerMove(touch(1, 3, 0))
		expect(zoomBy).not.toHaveBeenCalled()
		pinch.onPointerDown(touch(3, 3, 0.2))
		pinch.onPointerMove(touch(3, 3, 0.4))
		expect(zoomBy).not.toHaveBeenCalled()
	})
})
