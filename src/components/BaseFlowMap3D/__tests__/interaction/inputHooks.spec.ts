import { ref } from 'vue'
import { Group, OrthographicCamera } from 'three'
import { createPickAt } from '../../model/interaction/useFlowMap3DPointer'
import { useFlowMap3DFocus } from '../../model/interaction/useFlowMap3DFocus'
import { useFlowMap3DKeyboard } from '../../model/interaction/useFlowMap3DKeyboard'

describe('createPickAt', () => {
	const host = document.createElement('div')
	host.getBoundingClientRect = () => ({
		left: 0,
		top: 0,
		width: 800,
		height: 600,
		right: 800,
		bottom: 600,
		x: 0,
		y: 0,
		toJSON: () => ({}),
	})
	const camera = new OrthographicCamera(-10, 10, 10, -10)

	it('без содержимого или области узла под указателем нет', () => {
		const content = { nodes: { group: new Group() } } as never
		expect(createPickAt({ hostRef: ref(host), getContent: () => null, getCamera: () => camera })(10, 10)).toBeNull()
		expect(createPickAt({ hostRef: ref(null), getContent: () => content, getCamera: () => camera })(10, 10)).toBeNull()
		expect(createPickAt({ hostRef: ref(host), getContent: () => content, getCamera: () => camera })(10, 10)).toBeNull()
	})
})

function focusParts(isVisible: boolean) {
	const nodes = [{ id: 'a', label: 'Узел', status: 'ok' }]
	const emit = vi.fn()
	const parts = {
		model: {
			shown: ref({ nodes }),
			live: ref({}),
			data: ref({}),
			events: { emit },
		},
		focused: ref<string | null>(null),
		announce: vi.fn(),
		isVisible: vi.fn(() => isVisible),
		reveal: vi.fn(),
	}
	return { parts, emit }
}

describe('useFlowMap3DFocus', () => {
	it('фокус на видимом узле сообщает событие и озвучку; на скрытом — ещё и показывает узел', () => {
		const visible = focusParts(true)
		const focus = useFlowMap3DFocus(visible.parts as never)
		focus.move('a')
		expect(visible.emit).toHaveBeenCalledWith('focus-change', { entity: 'node', id: 'a' })
		expect(visible.parts.announce).toHaveBeenCalled()
		expect(visible.parts.reveal).not.toHaveBeenCalled()
		focus.clear()
		expect(visible.parts.focused.value).toBeNull()
		const hidden = focusParts(false)
		useFlowMap3DFocus(hidden.parts as never).move('a')
		expect(hidden.parts.reveal).toHaveBeenCalledWith('a')
	})

	it('пустой и неизвестный id фокус только снимают или ставят, но не сообщают', () => {
		const { parts, emit } = focusParts(true)
		const focus = useFlowMap3DFocus(parts as never)
		focus.move(null)
		focus.move('ghost')
		expect(emit).not.toHaveBeenCalled()
		expect(parts.focused.value).toBe('ghost')
	})
})

describe('useFlowMap3DKeyboard', () => {
	function keyboardParts() {
		const move = vi.fn()
		const options = {
			model: { shown: ref({ nodes: [{ id: 'a', label: 'Альфа' }] }), graph: ref({ outgoing: () => [], incoming: () => [] }) },
			labels: {
				spots: new Map([
					['a', { x: 10, y: 10, isVisible: true }],
					['b', { x: 50, y: 10, isVisible: false }],
				]),
			},
			camera: { rotate: vi.fn(), turn: vi.fn(), tilt: vi.fn(), zoomIn: vi.fn(), zoomOut: vi.fn(), home: vi.fn() },
			focus: { focused: ref<string | null>(null), move, clear: vi.fn() },
			pick: { pick: vi.fn(), clear: vi.fn() },
		}
		return { options, move }
	}

	it('скрытые бирки в обходе не участвуют; набор букв гасится вызовом `stop`', () => {
		const { options, move } = keyboardParts()
		const keyboard = useFlowMap3DKeyboard(options as never)
		const target = document.createElement('div')
		const press = (key: string) => {
			const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
			Object.defineProperty(event, 'target', { value: target })
			Object.defineProperty(event, 'currentTarget', { value: target })
			keyboard.onKeydown(event)
		}
		press('End')
		expect(move).toHaveBeenLastCalledWith('a')
		press('а')
		keyboard.stop()
	})
})
