import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import { UI_FLOW_MAP } from '@/locales/messages'
import { fireEvent, screen } from '@testing-library/vue'
import { mountMap, sceneView, stubFrame } from '../flowUi'

const board = () => screen.getByRole('graphics-document')

async function wheel(init: WheelEventInit): Promise<boolean> {
	const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init })
	board().dispatchEvent(event)
	await nextTick()
	return event.defaultPrevented
}

async function opened(props: Parameters<typeof mountMap>[0] = {}) {
	stubFrame(800, 400)
	const result = mountMap(props)
	await nextTick()
	await nextTick()
	return result
}

describe('BaseFlowMap жесты', () => {
	afterEach(() => {
		vi.useRealTimers()
	})

	it('колесо без Ctrl не меняет вид и показывает подсказку на 1,6 секунды', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
		const { container } = await opened()
		const before = sceneView(container)
		expect(await wheel({ deltaY: -100 })).toBe(false)
		expect(sceneView(container)).toEqual(before)
		expect(screen.getByText(UI_FLOW_MAP.WHEEL_HINT)).toBeInTheDocument()
		await fireEvent.wheel(board(), { deltaY: -100 })
		vi.advanceTimersByTime(1600)
		await nextTick()
		expect(screen.queryByText(UI_FLOW_MAP.WHEEL_HINT)).not.toBeInTheDocument()
	})

	it('колесо с Ctrl или ⌘ масштабирует вокруг указателя и гасит прокрутку страницы', async () => {
		const { container } = await opened()
		const before = sceneView(container)
		const isPrevented = await wheel({ deltaY: -100, ctrlKey: true, clientX: 200, clientY: 100 })
		const after = sceneView(container)
		expect(isPrevented).toBe(true)
		expect(after.zoom).toBeCloseTo(before.zoom * Math.exp(0.15), 5)
		expect((200 - after.x) / after.zoom).toBeCloseTo((200 - before.x) / before.zoom, 5)
		await fireEvent.wheel(board(), { deltaY: 100, metaKey: true, clientX: 200, clientY: 100 })
		expect(sceneView(container).zoom).toBeCloseTo(before.zoom, 5)
	})

	it('режим always масштабирует без Ctrl, режим none не реагирует и не подсказывает', async () => {
		const first = await opened({ wheelZoom: 'always' })
		const start = sceneView(first.container).zoom
		await fireEvent.wheel(board(), { deltaY: -100 })
		expect(sceneView(first.container).zoom).toBeGreaterThan(start)
		first.unmount()
		const second = await opened({ wheelZoom: 'none' })
		expect(await wheel({ deltaY: -100, ctrlKey: true })).toBe(false)
		expect(sceneView(second.container).zoom).toBe(start)
		expect(screen.queryByText(UI_FLOW_MAP.WHEEL_HINT)).not.toBeInTheDocument()
	})

	it('масштаб колесом не выходит за пределы 20–300 % и берёт пределы из пропсов', async () => {
		const first = await opened()
		await fireEvent.wheel(board(), { deltaY: -9000, ctrlKey: true })
		expect(sceneView(first.container).zoom).toBe(3)
		await fireEvent.wheel(board(), { deltaY: 9000, ctrlKey: true })
		expect(sceneView(first.container).zoom).toBe(0.2)
		first.unmount()
		const second = await opened({ minZoom: 0.5, maxZoom: 1.5 })
		await fireEvent.wheel(board(), { deltaY: -9000, ctrlKey: true })
		expect(sceneView(second.container).zoom).toBe(1.5)
		await fireEvent.wheel(board(), { deltaY: 9000, ctrlKey: true })
		expect(sceneView(second.container).zoom).toBe(0.5)
	})

	it('перетаскивание фона двигает вид, отпускание и отмена его останавливают', async () => {
		const { container } = await opened()
		const start = sceneView(container)
		await fireEvent.pointerDown(board(), { pointerId: 1, clientX: 10, clientY: 10 })
		await fireEvent.pointerMove(board(), { pointerId: 1, clientX: 40, clientY: 25 })
		expect(sceneView(container)).toEqual({ x: start.x + 30, y: start.y + 15, zoom: start.zoom })
		await fireEvent.pointerUp(board(), { pointerId: 1 })
		await fireEvent.pointerMove(board(), { pointerId: 1, clientX: 90, clientY: 90 })
		expect(sceneView(container).x).toBe(start.x + 30)
		await fireEvent.pointerDown(board(), { pointerId: 2, clientX: 0, clientY: 0 })
		await fireEvent.pointerCancel(board(), { pointerId: 2 })
		await fireEvent.pointerMove(board(), { pointerId: 2, clientX: 50, clientY: 50 })
		expect(sceneView(container).x).toBe(start.x + 30)
	})

	it('движение чужого указателя и нажатие не основной кнопкой вид не двигают', async () => {
		const { container } = await opened()
		const start = sceneView(container)
		await fireEvent.pointerMove(board(), { pointerId: 7, clientX: 50, clientY: 50 })
		await fireEvent.pointerDown(board(), { pointerId: 3, clientX: 0, clientY: 0, button: 2 })
		await fireEvent.pointerMove(board(), { pointerId: 3, clientX: 50, clientY: 50 })
		expect(sceneView(container)).toEqual(start)
	})

	it('нажатие на узел вид не двигает', async () => {
		const { container } = await opened()
		const start = sceneView(container)
		const node = screen.getByRole('graphics-object', { name: /^Alpha/ })
		await fireEvent.pointerDown(node, { pointerId: 4, clientX: 0, clientY: 0 })
		await fireEvent.pointerMove(board(), { pointerId: 4, clientX: 50, clientY: 50 })
		expect(sceneView(container)).toEqual(start)
	})

	it('щипок двумя пальцами масштабирует вокруг их середины', async () => {
		const { container } = await opened()
		const start = sceneView(container)
		await fireEvent.pointerDown(board(), { pointerId: 1, clientX: 100, clientY: 100 })
		await fireEvent.pointerDown(board(), { pointerId: 2, clientX: 200, clientY: 100 })
		await fireEvent.pointerMove(board(), { pointerId: 2, clientX: 300, clientY: 100 })
		expect(sceneView(container).zoom).toBeCloseTo(start.zoom * 2, 5)
		await fireEvent.pointerMove(board(), { pointerId: 1, clientX: 100, clientY: 100 })
		expect(sceneView(container).zoom).toBeCloseTo(start.zoom * 2, 5)
	})

	it('щипок с совпавшими пальцами вид не меняет', async () => {
		const { container } = await opened()
		await fireEvent.pointerDown(board(), { pointerId: 1, clientX: 100, clientY: 100 })
		await fireEvent.pointerDown(board(), { pointerId: 2, clientX: 100, clientY: 100 })
		const start = sceneView(container)
		await fireEvent.pointerMove(board(), { pointerId: 2, clientX: 140, clientY: 100 })
		expect(sceneView(container)).toEqual(start)
	})

	it('пан начинается после сдвига больше 4 px и считает его от точки нажатия', async () => {
		const { container } = await opened()
		const start = sceneView(container)
		await fireEvent.pointerDown(board(), { pointerId: 1, clientX: 10, clientY: 10 })
		await fireEvent.pointerMove(board(), { pointerId: 1, clientX: 12, clientY: 12 })
		await fireEvent.pointerMove(board(), { pointerId: 1, clientX: 14, clientY: 10 })
		expect(sceneView(container)).toEqual(start)
		await fireEvent.pointerMove(board(), { pointerId: 1, clientX: 25, clientY: 10 })
		expect(sceneView(container)).toEqual({ x: start.x + 15, y: start.y, zoom: start.zoom })
		await fireEvent.pointerMove(board(), { pointerId: 1, clientX: 26, clientY: 10 })
		expect(sceneView(container).x).toBe(start.x + 16)
	})

	it('после отпускания новый жест снова ждёт порога', async () => {
		const { container } = await opened()
		const start = sceneView(container)
		await fireEvent.pointerDown(board(), { pointerId: 1, clientX: 0, clientY: 0 })
		await fireEvent.pointerMove(board(), { pointerId: 1, clientX: 20, clientY: 0 })
		await fireEvent.pointerUp(board(), { pointerId: 1 })
		await fireEvent.pointerDown(board(), { pointerId: 1, clientX: 50, clientY: 50 })
		await fireEvent.pointerMove(board(), { pointerId: 1, clientX: 52, clientY: 50 })
		expect(sceneView(container).x).toBe(start.x + 20)
	})
})
