import { ref, shallowRef } from 'vue'
import { runInHost } from '../../ui/flowUi'
import { useFlowModes } from '../../../../model/lazy/useFlowModes'
import type { FlowMode } from '../../../../types/api/flowController.types'

function modesOf(mode: FlowMode) {
	const model = { mode: ref(mode), scenario: { isLoaded: ref(false) } }
	const parts = { model, map: {}, element: shallowRef(null), props: {}, announce: vi.fn() }
	const props = { data: { version: 1, nodes: [], edges: [] } }
	return { model, ...runInHost(() => useFlowModes(props as never, parts as never)) }
}

describe('useFlowModes: состояние до загрузки частей', () => {
	it('в просмотре ничего не включено, сетка по умолчанию включена, сценарий не загружен', () => {
		const { value } = modesOf('view')
		const { state } = value
		expect(state.isEditing.value).toBe(false)
		expect(state.isReviewing.value).toBe(false)
		expect(state.isEditLoaded.value).toBe(false)
		expect(state.isReviewLoaded.value).toBe(false)
		expect(state.isScenarioLoaded.value).toBe(false)
		expect(state.isGridOn.value).toBe(true)
		expect(value.edit.part.value).toBeNull()
		expect(value.review.part.value).toBeNull()
	})

	it('режим «Правки» до загрузки части не включён: isReviewing ложно, а загрузка идёт в фоне', () => {
		const { value } = modesOf('review')
		expect(value.state.isReviewing.value).toBe(false)
		expect(value.state.isReviewLoaded.value).toBe(false)
	})

	it('признак загрузки сценария следует за моделью', () => {
		const { value, model } = modesOf('view')
		model.scenario.isLoaded.value = true
		expect(value.state.isScenarioLoaded.value).toBe(true)
	})
})
