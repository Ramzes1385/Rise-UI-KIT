import { withSetup } from './BaseMediaPlayer.test-utils'
import { useCaptionStyle } from '../model/useCaptionStyle'

const STORAGE_KEY = 'rise-media:captions'

function rect(width: number, height: number): DOMRect {
	return { width, height, top: 0, left: 0, right: width, bottom: height, x: 0, y: 0, toJSON: () => ({}) }
}

function frame(areaSize: [number, number] = [1000, 500], boxSize: [number, number] = [200, 50]) {
	const area = document.createElement('div')
	const box = document.createElement('div')
	area.append(box)
	area.getBoundingClientRect = () => rect(...areaSize)
	box.getBoundingClientRect = () => rect(...boxSize)
	return box
}

function pointer(box: HTMLElement, init: Partial<PointerEvent> = {}): PointerEvent {
	return {
		button: 0,
		pointerId: 1,
		clientX: 0,
		clientY: 0,
		currentTarget: box,
		preventDefault: vi.fn(),
		...init,
	} as unknown as PointerEvent
}

function setup() {
	return withSetup(() => useCaptionStyle()).result
}

describe('useCaptionStyle', () => {
	afterEach(() => {
		localStorage.clear()
		vi.restoreAllMocks()
	})

	it('по умолчанию: 100 %, белый, полупрозрачный фон, внизу; стиль и классы блока', () => {
		const style = setup()

		expect(style.captionStyle.value).toEqual({ size: 100, color: 'white', background: 'semi', position: { x: 50, y: 86 } })
		expect(style.captionBoxStyle.value).toEqual({ left: '50%', top: '86%', '--caption-scale': 1 })
		expect(style.captionBoxClass.value).toEqual([
			'base-media-player__caption-box--color-white',
			'base-media-player__caption-box--background-semi',
			{ 'base-media-player__caption-box--raised': true, 'base-media-player__caption-box--dragging': false },
		])
	})

	it('изменения сохраняются в браузере и читаются при следующем запуске', () => {
		setup().updateCaptionStyle({ size: 150, color: 'yellow', position: { x: 50, y: 12 } })

		const next = setup()
		expect(next.captionStyle.value).toEqual({ size: 150, color: 'yellow', background: 'semi', position: { x: 50, y: 12 } })
		expect(next.captionBoxStyle.value['--caption-scale']).toBe(1.5)
		expect(next.captionBoxClass.value[2]).toEqual(expect.objectContaining({ 'base-media-player__caption-box--raised': false }))
	})

	it.each([
		['не JSON', '{'],
		['null', 'null'],
		['чужие значения', JSON.stringify({ size: 33, color: 'red', background: 'pink', position: { x: 150, y: '10' } })],
	])('сохранённое значение «%s» заменяется значениями по умолчанию', (_, saved) => {
		localStorage.setItem(STORAGE_KEY, saved)

		expect(setup().captionStyle.value).toEqual({ size: 100, color: 'white', background: 'semi', position: { x: 50, y: 86 } })
	})

	it('без доступа к хранилищу стиль всё равно меняется', () => {
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('quota', 'QuotaExceededError')
		})
		const style = setup()

		style.updateCaptionStyle({ background: 'none' })
		expect(style.captionStyle.value.background).toBe('none')
	})

	it('перетаскивание: сдвиг в процентах кадра, блок не выходит за край, позиция сохраняется', () => {
		const style = setup()
		const box = frame()
		const down = pointer(box, { clientX: 500, clientY: 430 })

		style.onCaptionPointerDown(down)
		expect(down.preventDefault).toHaveBeenCalled()
		expect(style.isCaptionDragging.value).toBe(true)
		style.onCaptionPointerMove(pointer(box, { clientX: 400, clientY: 230 }))
		expect(style.captionStyle.value.position).toEqual({ x: 40, y: 46 })
		style.onCaptionPointerMove(pointer(box, { clientX: -2000, clientY: 2000 }))
		expect(style.captionStyle.value.position).toEqual({ x: 10, y: 95 })
		expect(localStorage.getItem(STORAGE_KEY)).toBeNull()

		style.onCaptionPointerUp()
		style.onCaptionPointerUp()
		expect(style.isCaptionDragging.value).toBe(false)
		expect(JSON.parse(localStorage.getItem(STORAGE_KEY) as string).position).toEqual({ x: 10, y: 95 })
	})

	it('захват указателя, если браузер его поддерживает', () => {
		const style = setup()
		const box = frame()
		box.setPointerCapture = vi.fn()

		style.onCaptionPointerDown(pointer(box, { pointerId: 7 }))
		expect(box.setPointerCapture).toHaveBeenCalledWith(7)
	})

	it('не левая кнопка, кадр без размера и движение без нажатия ничего не делают', () => {
		const style = setup()
		const box = frame()
		const right = pointer(box, { button: 2 })

		style.onCaptionPointerDown(right)
		style.onCaptionPointerDown(pointer(frame([0, 0])))
		style.onCaptionPointerDown(pointer(document.createElement('div')))
		style.onCaptionPointerMove(pointer(box, { clientX: 100 }))
		expect(right.preventDefault).not.toHaveBeenCalled()
		expect(style.isCaptionDragging.value).toBe(false)
		expect(style.captionStyle.value.position).toEqual({ x: 50, y: 86 })
	})
})
