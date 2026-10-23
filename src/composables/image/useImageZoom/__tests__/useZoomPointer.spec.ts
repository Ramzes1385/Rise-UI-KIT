import { ref } from 'vue'
import { useZoomPointer } from '../gestures/useZoomPointer'

function setup(overrides: { scale?: number; center?: { x: number; y: number } | null } = {}) {
	const currentScale = ref(overrides.scale ?? 2)
	const panBy = vi.fn<(dx: number, dy: number) => boolean>(() => true)
	const zoomAround = vi.fn<(scale: number, anchor: { x: number; y: number }) => void>()
	const center = overrides.center === undefined ? { x: 100, y: 100 } : overrides.center
	const pointer = useZoomPointer({ currentScale, panBy, zoomAround, getImageCenter: () => center })
	const area = document.createElement('div')
	area.addEventListener('pointerdown', pointer.handlePointerDown)
	area.addEventListener('pointermove', pointer.handlePointerMove)
	area.addEventListener('pointerup', pointer.handlePointerEnd)
	area.addEventListener('pointercancel', pointer.handlePointerEnd)
	area.addEventListener('lostpointercapture', pointer.handlePointerEnd)
	return { pointer, currentScale, panBy, zoomAround, area }
}

function fire(area: HTMLElement, type: string, init: PointerEventInit): void {
	area.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'touch', button: 0, ...init }))
}

describe('useZoomPointer', () => {
	it('один палец при масштабе больше 1 двигает изображение на смещение пальца', () => {
		const { pointer, panBy, area } = setup()

		fire(area, 'pointerdown', { pointerId: 1, clientX: 10, clientY: 10 })
		expect(pointer.isPanning.value).toBe(true)
		fire(area, 'pointermove', { pointerId: 1, clientX: 30, clientY: 25 })
		fire(area, 'pointermove', { pointerId: 1, clientX: 40, clientY: 25 })

		expect(panBy).toHaveBeenNthCalledWith(1, 20, 15)
		expect(panBy).toHaveBeenNthCalledWith(2, 10, 0)
		fire(area, 'pointerup', { pointerId: 1, clientX: 40, clientY: 25 })
		expect(pointer.isPanning.value).toBe(false)
	})

	it('при масштабе 1 один палец изображение не двигает и жестом не считается', () => {
		const { pointer, panBy, area } = setup({ scale: 1 })

		fire(area, 'pointerdown', { pointerId: 1, clientX: 10, clientY: 10 })
		fire(area, 'pointermove', { pointerId: 1, clientX: 80, clientY: 10 })

		expect(pointer.isPanning.value).toBe(false)
		expect(panBy).not.toHaveBeenCalled()
		expect(pointer.consumeDrag()).toBe(false)
	})

	it('мышь двигает изображение левой кнопкой, правая и средняя игнорируются', () => {
		const { pointer, panBy, area } = setup()

		fire(area, 'pointerdown', { pointerId: 1, pointerType: 'mouse', button: 2, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 1, pointerType: 'mouse', clientX: 30, clientY: 0 })
		expect(panBy).not.toHaveBeenCalled()
		expect(pointer.isPanning.value).toBe(false)

		fire(area, 'pointerdown', { pointerId: 2, pointerType: 'mouse', button: 0, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 2, pointerType: 'mouse', buttons: 1, clientX: 30, clientY: 0 })
		expect(panBy).toHaveBeenCalledWith(30, 0)
	})

	it('сдвиг дальше порога гасит следующий клик один раз, мелкий — нет', () => {
		const { pointer, area } = setup()

		fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 1, clientX: 3, clientY: 0 })
		fire(area, 'pointerup', { pointerId: 1, clientX: 3, clientY: 0 })
		expect(pointer.consumeDrag()).toBe(false)

		fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 1, clientX: 20, clientY: 0 })
		fire(area, 'pointerup', { pointerId: 1, clientX: 20, clientY: 0 })
		expect(pointer.consumeDrag()).toBe(true)
		expect(pointer.consumeDrag()).toBe(false)
	})

	it('новое нажатие сбрасывает признак перетаскивания прошлого жеста', () => {
		const { pointer, area } = setup()
		fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 1, clientX: 40, clientY: 0 })
		fire(area, 'pointerup', { pointerId: 1, clientX: 40, clientY: 0 })

		fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })

		expect(pointer.consumeDrag()).toBe(false)
	})

	it('щипок двумя пальцами меняет масштаб вокруг середины между ними и двигает на смещение середины', () => {
		const { pointer, zoomAround, panBy, area } = setup({ scale: 2 })
		fire(area, 'pointerdown', { pointerId: 1, clientX: 80, clientY: 100 })
		fire(area, 'pointerdown', { pointerId: 2, clientX: 120, clientY: 100 })
		expect(pointer.isPanning.value).toBe(true)

		fire(area, 'pointermove', { pointerId: 2, clientX: 160, clientY: 100 })

		expect(zoomAround).toHaveBeenCalledWith(4, { x: 0, y: 0 })
		expect(panBy).toHaveBeenCalledWith(20, 0)
		expect(pointer.consumeDrag()).toBe(true)
	})

	it('центр изображения неизвестен — масштаб вокруг середины пальцев без смещения', () => {
		const { zoomAround, area } = setup({ center: null })
		fire(area, 'pointerdown', { pointerId: 1, clientX: 80, clientY: 100 })
		fire(area, 'pointerdown', { pointerId: 2, clientX: 120, clientY: 100 })

		fire(area, 'pointermove', { pointerId: 1, clientX: 60, clientY: 100 })

		expect(zoomAround).toHaveBeenCalledWith(2 * (60 / 40), { x: 0, y: 0 })
	})

	it('пальцы в одной точке — масштаб не меняется', () => {
		const { zoomAround, area } = setup()
		fire(area, 'pointerdown', { pointerId: 1, clientX: 50, clientY: 50 })
		fire(area, 'pointerdown', { pointerId: 2, clientX: 50, clientY: 50 })

		fire(area, 'pointermove', { pointerId: 2, clientX: 70, clientY: 50 })

		expect(zoomAround).toHaveBeenCalledWith(2, expect.any(Object))
	})

	it('щипок с масштаба 1: после него один оставшийся палец двигает изображение', () => {
		const { pointer, currentScale, panBy, area } = setup({ scale: 1 })
		fire(area, 'pointerdown', { pointerId: 1, clientX: 80, clientY: 100 })
		fire(area, 'pointerdown', { pointerId: 2, clientX: 120, clientY: 100 })
		currentScale.value = 2
		fire(area, 'pointerup', { pointerId: 2, clientX: 120, clientY: 100 })
		expect(pointer.isPanning.value).toBe(true)

		fire(area, 'pointermove', { pointerId: 1, clientX: 90, clientY: 100 })

		expect(panBy).toHaveBeenCalledWith(10, 0)
	})

	it('движение чужого указателя и третий палец ничего не делают', () => {
		const { zoomAround, panBy, area } = setup()
		fire(area, 'pointermove', { pointerId: 9, clientX: 10, clientY: 10 })
		fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
		fire(area, 'pointerdown', { pointerId: 2, clientX: 40, clientY: 0 })
		fire(area, 'pointerdown', { pointerId: 3, clientX: 90, clientY: 0 })

		fire(area, 'pointermove', { pointerId: 3, clientX: 99, clientY: 0 })

		expect(zoomAround).not.toHaveBeenCalled()
		expect(panBy).not.toHaveBeenCalled()
	})

	it('указатель не захватывается при нажатии: обычный клик по изображению остаётся кликом по нему', () => {
		const { area } = setup()
		const capture = vi.fn<(id: number) => void>()
		area.setPointerCapture = capture
		fire(area, 'pointerdown', { pointerId: 7, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 7, clientX: 3, clientY: 0 })
		fire(area, 'pointerup', { pointerId: 7, clientX: 3, clientY: 0 })

		expect(capture).not.toHaveBeenCalled()
	})

	it('захват указателя — после порога сдвига, один раз на жест; синтетический указатель без захвата не ломает жест', () => {
		const { area, panBy } = setup()
		const capture = vi.fn<(id: number) => void>()
		area.setPointerCapture = capture
		fire(area, 'pointerdown', { pointerId: 7, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 7, clientX: 20, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 7, clientX: 40, clientY: 0 })
		expect(capture).toHaveBeenCalledTimes(1)
		expect(capture).toHaveBeenCalledWith(7)
		fire(area, 'pointerup', { pointerId: 7, clientX: 40, clientY: 0 })

		area.setPointerCapture = () => {
			throw new Error('NotFoundError')
		}
		fire(area, 'pointerdown', { pointerId: 8, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 8, clientX: 10, clientY: 0 })
		expect(panBy).toHaveBeenCalledWith(10, 0)
	})

	it('щипок захватывает оба указателя', () => {
		const { area } = setup()
		const capture = vi.fn<(id: number) => void>()
		area.setPointerCapture = capture
		fire(area, 'pointerdown', { pointerId: 1, clientX: 80, clientY: 100 })
		fire(area, 'pointerdown', { pointerId: 2, clientX: 120, clientY: 100 })
		expect(capture).not.toHaveBeenCalled()

		fire(area, 'pointermove', { pointerId: 2, clientX: 160, clientY: 100 })

		expect(capture.mock.calls.map(call => call[0]).sort()).toEqual([1, 2])
	})

	it('prepareGesture сбрасывает признак перетаскивания прошлого жеста, пока нет нажатых указателей', () => {
		const { pointer, area } = setup()
		fire(area, 'pointerdown', { pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 40, clientY: 0 })
		fire(area, 'pointerup', { pointerId: 1, pointerType: 'mouse', clientX: 40, clientY: 0 })

		pointer.prepareGesture()

		expect(pointer.consumeDrag()).toBe(false)
	})

	it('prepareGesture не сбрасывает признак, пока жест идёт', () => {
		const { pointer, area } = setup()
		fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 1, clientX: 40, clientY: 0 })

		pointer.prepareGesture()

		expect(pointer.consumeDrag()).toBe(true)
	})

	it('мышь без нажатой кнопки (отпущена вне области) жест заканчивает, а не двигает изображение', () => {
		const { pointer, panBy, area } = setup()
		fire(area, 'pointerdown', { pointerId: 1, pointerType: 'mouse', clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 1, pointerType: 'mouse', buttons: 0, clientX: 40, clientY: 0 })

		expect(panBy).not.toHaveBeenCalled()
		expect(pointer.isPanning.value).toBe(false)
		fire(area, 'pointermove', { pointerId: 1, pointerType: 'mouse', buttons: 1, clientX: 80, clientY: 0 })
		expect(panBy).not.toHaveBeenCalled()
	})

	it('lostpointercapture завершает жест, повторное завершение безвредно', () => {
		const { pointer, area } = setup()
		fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
		expect(pointer.isPanning.value).toBe(true)
		fire(area, 'lostpointercapture', { pointerId: 1 })
		expect(pointer.isPanning.value).toBe(false)
		fire(area, 'pointerup', { pointerId: 1, clientX: 0, clientY: 0 })
		expect(pointer.isPanning.value).toBe(false)
	})

	it('pointercancel завершает жест, resetPointers очищает всё', () => {
		const { pointer, area } = setup()
		fire(area, 'pointerdown', { pointerId: 1, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 1, clientX: 40, clientY: 0 })
		fire(area, 'pointercancel', { pointerId: 1, clientX: 40, clientY: 0 })
		expect(pointer.isPanning.value).toBe(false)

		fire(area, 'pointerdown', { pointerId: 2, clientX: 0, clientY: 0 })
		fire(area, 'pointermove', { pointerId: 2, clientX: 40, clientY: 0 })
		pointer.resetPointers()

		expect(pointer.isPanning.value).toBe(false)
		expect(pointer.consumeDrag()).toBe(false)
	})
})
