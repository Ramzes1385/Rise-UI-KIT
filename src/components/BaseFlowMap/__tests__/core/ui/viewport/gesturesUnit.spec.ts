import { ref } from 'vue'
import { runInHost } from '../flowUi'
import { useFlowGestures } from '../../../../model/viewport/useFlowGestures'
import type { FlowFrameState, FlowViewState } from '../../../../types/internal/core/flowRenderInternal.types'

function setup(wheelZoom?: 'ctrl' | 'always' | 'none', element: HTMLElement | null = null) {
	const setViewport = vi.fn()
	const view = {
		viewport: ref({ x: 0, y: 0, zoom: 1 }),
		hint: ref(false),
		limits: () => ({ min: 0.2, max: 3 }),
		setViewport,
	} as unknown as FlowViewState
	const frame = { element: ref(element) } as unknown as FlowFrameState
	const { value } = runInHost(() => useFlowGestures({ wheelZoom }, frame, view))
	return { handlers: value, setViewport, view }
}

const wheelEvent = (init: Partial<WheelEvent>) =>
	({ deltaY: -100, clientX: 30, clientY: 40, ctrlKey: true, metaKey: false, preventDefault: vi.fn(), ...init }) as unknown as WheelEvent

describe('useFlowGestures без элемента области', () => {
	it('координаты считаются от нуля, а режим по умолчанию — ctrl', () => {
		const { handlers, setViewport, view } = setup(undefined)
		const event = wheelEvent({})
		handlers.onWheel(event)
		expect(event.preventDefault).toHaveBeenCalled()
		expect(setViewport).toHaveBeenCalledTimes(1)
		handlers.onWheel(wheelEvent({ ctrlKey: false }))
		expect(setViewport).toHaveBeenCalledTimes(1)
		expect(view.hint.value).toBe(true)
	})

	it('нажатие без элемента запоминает указатель и не падает', () => {
		const { handlers, setViewport } = setup('always')
		const target = document.createElement('div')
		handlers.onPointerdown({ button: 0, pointerId: 1, clientX: 5, clientY: 6, target } as unknown as PointerEvent)
		handlers.onPointermove({ pointerId: 1, clientX: 15, clientY: 26 } as unknown as PointerEvent)
		expect(setViewport).toHaveBeenCalledWith({ x: 10, y: 20, zoom: 1 })
	})

	it('захват указателя вызывается, если элемент его поддерживает', () => {
		const element = document.createElement('div')
		element.setPointerCapture = vi.fn()
		const { handlers } = setup('ctrl', element)
		handlers.onPointerdown({ button: 0, pointerId: 9, clientX: 0, clientY: 0, target: element } as unknown as PointerEvent)
		expect(element.setPointerCapture).toHaveBeenCalledWith(9)
	})
})
