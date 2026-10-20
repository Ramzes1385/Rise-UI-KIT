import { ref } from 'vue'
import { useRoadmap3DInput } from '../../../model/compose/useRoadmap3DInput'

const picks: { current: Record<string, (id: string | null) => void> } = { current: {} }
vi.mock('../../../model/interaction/useRoadmap3DPointer', () => ({
	useRoadmap3DPointer: (options: { pick: Record<string, (id: string | null) => void> }) => {
		picks.current = options.pick
		return {}
	},
}))
vi.mock('../../../model/interaction/useRoadmap3DKeyboard', () => ({ useRoadmap3DKeyboard: () => ({}) }))
vi.mock('../../../model/interaction/useRoadmap3DList', () => ({ useRoadmap3DList: () => [] }))
vi.mock('@composables/interaction/useSwipe', () => ({ useSwipe: () => ({}) }))

function build() {
	const focus = { hovered: ref<string | null>(null), focusStage: vi.fn(), go: vi.fn() }
	const panel = { selectTopic: vi.fn(), closePanel: vi.fn() }
	const tour = { stop: vi.fn() }
	const snapshot = ref({ stages: [{ id: 'a' }] })
	const parts = { focus, tour, model: { isEditing: ref(false) }, snapshot, edit: {}, panel, hostRef: ref(null) }
	const stage = { camera: { pinchZoom: vi.fn() }, content: ref(null), viewport: { camera: ref(null) } }
	useRoadmap3DInput(parts as never, stage as never)
	return { focus, panel, tour }
}

describe('useRoadmap3DInput: колбэки указателя', () => {
	it('hover: этап подсвечивается, чужой id и null — сбрасывают', () => {
		const { focus } = build()
		picks.current.hover('a')
		expect(focus.hovered.value).toBe('a')
		picks.current.hover('нет')
		expect(focus.hovered.value).toBeNull()
	})

	it('pick: этап фокусируется, тема выбирается; clear закрывает панель; input останавливает тур', () => {
		const { focus, panel, tour } = build()
		picks.current.pick('a')
		expect(focus.focusStage).toHaveBeenCalledWith('a')
		picks.current.pick('topic-1')
		expect(panel.selectTopic).toHaveBeenCalledWith('topic-1')
		picks.current.clear(null)
		expect(panel.closePanel).toHaveBeenCalled()
		picks.current.input(null)
		expect(tour.stop).toHaveBeenCalled()
	})
})
