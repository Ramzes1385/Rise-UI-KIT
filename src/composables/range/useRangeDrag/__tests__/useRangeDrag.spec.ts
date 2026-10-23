import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { useRangeDrag } from '../useRangeDrag'
import type { UseRangeDragOptions, UseRangeDragReturn } from '../types/useRangeDrag.types'

interface Setup {
	drag: UseRangeDragReturn
	options: UseRangeDragOptions
	unmount: () => void
}

function createTrack(): HTMLElement {
	const track = document.createElement('div')
	track.getBoundingClientRect = () => ({
		left: 0,
		top: 0,
		width: 100,
		height: 200,
		right: 100,
		bottom: 200,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	})
	return track
}

function setup(overrides: Partial<UseRangeDragOptions> = {}): Setup {
	const options: UseRangeDragOptions = {
		trackRef: { value: createTrack() },
		pointValues: { value: [20, 60] },
		isDisabled: () => false,
		min: () => 0,
		max: () => 100,
		step: () => 10,
		isVertical: () => false,
		thumbMin: index => (index === 0 ? 0 : 20),
		thumbMax: index => (index === 0 ? 60 : 100),
		snapToStepValue: value => Math.round(value / 10) * 10,
		setPointValue: vi.fn(),
		emitChange: vi.fn(),
		...overrides,
	}
	let drag!: UseRangeDragReturn
	const wrapper = mount(
		defineComponent({
			setup() {
				drag = useRangeDrag(options)
				return () => h('div')
			},
		}),
	)
	return { drag, options, unmount: () => wrapper.unmount() }
}

function mouse(type: string, clientX: number, clientY = 0): MouseEvent {
	return new MouseEvent(type, { clientX, clientY, bubbles: true })
}

function touch(type: string, clientX: number, clientY = 0): TouchEvent {
	const event = new Event(type, { bubbles: true }) as TouchEvent
	Object.defineProperty(event, 'touches', { value: [{ clientX, clientY }] })
	return event
}

describe('useRangeDrag', () => {
	it('перетаскивает ползунок мышью и эмитит change при отпускании', () => {
		const { drag, options } = setup()
		drag.handleThumbDown({ event: mouse('mousedown', 20), index: 1 })
		expect(drag.activeIndex.value).toBe(1)

		document.dispatchEvent(mouse('mousemove', 73))
		expect(options.setPointValue).toHaveBeenLastCalledWith(1, 70)

		document.dispatchEvent(mouse('mouseup', 73))
		expect(drag.activeIndex.value).toBeNull()
		expect(options.emitChange).toHaveBeenCalledTimes(1)

		document.dispatchEvent(mouse('mousemove', 90))
		expect(options.setPointValue).toHaveBeenCalledTimes(1)
	})

	it('перетаскивает ползунок касанием и ограничивает значение треком', () => {
		const { drag, options } = setup()
		drag.handleThumbDown({ event: touch('touchstart', 20), index: 0 })

		document.dispatchEvent(touch('touchmove', 150))
		expect(options.setPointValue).toHaveBeenLastCalledWith(0, 100)
		document.dispatchEvent(touch('touchmove', -30))
		expect(options.setPointValue).toHaveBeenLastCalledWith(0, 0)

		document.dispatchEvent(touch('touchend', 0))
		expect(drag.activeIndex.value).toBeNull()
		expect(options.emitChange).toHaveBeenCalledTimes(1)

		document.dispatchEvent(touch('touchmove', 50))
		expect(options.setPointValue).toHaveBeenCalledTimes(2)
	})

	it('в вертикальном режиме считает значение снизу вверх', () => {
		const { drag, options } = setup({ isVertical: () => true })
		drag.handleThumbDown({ event: mouse('mousedown', 0, 0), index: 0 })
		document.dispatchEvent(mouse('mousemove', 0, 50))
		expect(options.setPointValue).toHaveBeenLastCalledWith(0, 80)
		document.dispatchEvent(mouse('mouseup', 0, 50))
	})

	it('клик по треку двигает ближайший ползунок и начинает перетаскивание', () => {
		const { drag, options } = setup({ pointValues: { value: [10, 50, 90] } })
		drag.handleTrackDown(mouse('mousedown', 58))
		expect(drag.activeIndex.value).toBe(1)
		expect(options.setPointValue).toHaveBeenLastCalledWith(1, 60)

		document.dispatchEvent(mouse('mousemove', 44))
		expect(options.setPointValue).toHaveBeenLastCalledWith(1, 40)
		document.dispatchEvent(mouse('mouseup', 44))
		expect(options.emitChange).toHaveBeenCalledTimes(1)
	})

	it('клик по треку у первой точки выбирает первый ползунок', () => {
		const { drag, options } = setup({ pointValues: { value: [10, 50, 90] } })
		drag.handleTrackDown(mouse('mousedown', 3))
		expect(options.setPointValue).toHaveBeenLastCalledWith(0, 0)
		document.dispatchEvent(mouse('mouseup', 3))
	})

	it('в отключённом состоянии не реагирует на мышь, касание и клавиатуру', () => {
		const { drag, options } = setup({ isDisabled: () => true })
		drag.handleThumbDown({ event: mouse('mousedown', 20), index: 0 })
		drag.handleTrackDown(mouse('mousedown', 20))
		const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true })
		drag.handleThumbKeydown({ event, index: 0 })

		expect(drag.activeIndex.value).toBeNull()
		expect(options.setPointValue).not.toHaveBeenCalled()
		expect(event.defaultPrevented).toBe(false)
	})

	it.each([
		['ArrowRight', 0, 30],
		['ArrowUp', 0, 30],
		['ArrowLeft', 1, 50],
		['ArrowDown', 1, 50],
	])('клавиша %s сдвигает ползунок на шаг и эмитит change с новыми значениями', (key, index, expected) => {
		const { drag, options } = setup()
		const event = new KeyboardEvent('keydown', { key, cancelable: true })
		drag.handleThumbKeydown({ event, index })

		expect(event.defaultPrevented).toBe(true)
		expect(options.setPointValue).toHaveBeenCalledWith(index, expected)
		const values = [20, 60]
		values[index] = expected
		expect(options.emitChange).toHaveBeenCalledWith(values)
	})

	it.each([
		['PageUp', 0, 120, 'плюс 10 шагов'],
		['PageDown', 1, -40, 'минус 10 шагов'],
		['Home', 1, 0, 'min'],
		['End', 0, 100, 'max'],
	])('клавиша %s у ползунка %i даёт %i (%s); соседей учитывает setPointValue', (key, index, target) => {
		const { drag, options } = setup({ snapToStepValue: value => value })
		const event = new KeyboardEvent('keydown', { key, cancelable: true })
		drag.handleThumbKeydown({ event, index })

		expect(event.defaultPrevented).toBe(true)
		expect(options.setPointValue).toHaveBeenCalledWith(index, target)
	})

	it('PageUp эмитит change со значением, ограниченным соседом', () => {
		const { drag, options } = setup({ snapToStepValue: value => value })
		drag.handleThumbKeydown({ event: new KeyboardEvent('keydown', { key: 'PageUp' }), index: 0 })

		expect(options.emitChange).toHaveBeenCalledWith([60, 60])
	})

	it('Home у первого ползунка в min не даёт change', () => {
		const { drag, options } = setup({ pointValues: { value: [0, 60] } })
		const event = new KeyboardEvent('keydown', { key: 'Home', cancelable: true })
		drag.handleThumbKeydown({ event, index: 0 })

		expect(event.defaultPrevented).toBe(true)
		expect(options.setPointValue).toHaveBeenCalledWith(0, 0)
		expect(options.emitChange).not.toHaveBeenCalled()
	})

	it('упор в соседний ползунок не даёт change', () => {
		const { drag, options } = setup({ pointValues: { value: [60, 60] } })
		const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true })
		drag.handleThumbKeydown({ event, index: 0 })

		expect(options.setPointValue).toHaveBeenCalledWith(0, 70)
		expect(options.emitChange).not.toHaveBeenCalled()
	})

	it('игнорирует остальные клавиши', () => {
		const { drag, options } = setup()
		const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true })
		drag.handleThumbKeydown({ event, index: 0 })

		expect(event.defaultPrevented).toBe(false)
		expect(options.setPointValue).not.toHaveBeenCalled()
	})

	it('снимает слушатели документа при размонтировании', () => {
		const { drag, options, unmount } = setup()
		drag.handleThumbDown({ event: mouse('mousedown', 20), index: 0 })
		unmount()

		document.dispatchEvent(mouse('mousemove', 80))
		document.dispatchEvent(mouse('mouseup', 80))
		expect(options.setPointValue).not.toHaveBeenCalled()
		expect(options.emitChange).not.toHaveBeenCalled()
	})
})
