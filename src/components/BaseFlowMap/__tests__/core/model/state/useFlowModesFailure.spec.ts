import { ref, shallowRef } from 'vue'
import { runInHost } from '../../ui/flowUi'
import { useFlowModes } from '../../../../model/state/useFlowModes'
import type { FlowMode } from '../../../../types/api/flowController.types'

const fakes = vi.hoisted(() => ({ edit: null as never as Record<string, never>, review: null as never as Record<string, never> }))

vi.mock('../../../../model/edit/useFlowEditLoader', () => ({ useFlowEditLoader: () => fakes.edit }))
vi.mock('../../../../model/review/useFlowReviewLoader', () => ({ useFlowReviewLoader: () => fakes.review }))

function fakeLoader() {
	return { part: shallowRef(null), error: ref(false), retry: vi.fn(), isLoaded: ref(false), load: vi.fn(), prefetch: vi.fn() }
}

function setup(mode: FlowMode, preload = vi.fn(() => Promise.resolve()), modes: string[] = []) {
	fakes.edit = fakeLoader() as never
	fakes.review = fakeLoader() as never
	const model = { mode: ref(mode), scenario: { isLoaded: ref(false) } }
	const parts = { model, map: {}, element: shallowRef(null), props: { modes }, announce: vi.fn(), preload }
	const props = { data: { version: 1, nodes: [], edges: [] } }
	const { value } = runInHost(() => useFlowModes(props as never, parts as never))
	return {
		state: value.state,
		preload,
		edit: fakes.edit as never as ReturnType<typeof fakeLoader>,
		review: fakes.review as never as ReturnType<typeof fakeLoader>,
	}
}

describe('useFlowModes: сбой загрузки', () => {
	it('без сбоев isLoadFailed ложно', () => {
		expect(setup('view').state.isLoadFailed.value).toBe(false)
	})

	it('сбой модели «Правки» поднимает isLoadFailed, retry повторяет обе модели', () => {
		const { state, edit, review } = setup('view')
		edit.error.value = true
		expect(state.isLoadFailed.value).toBe(true)
		state.retry()
		expect(edit.retry).toHaveBeenCalledTimes(1)
		expect(review.retry).toHaveBeenCalledTimes(1)
	})

	it('сбой модели «Правок» поднимает isLoadFailed', () => {
		const { state, review } = setup('view')
		review.error.value = true
		expect(state.isLoadFailed.value).toBe(true)
	})

	it('сбой кода интерфейса правки поднимает isLoadFailed; retry сбрасывает его и грузит интерфейс снова', async () => {
		const preload = vi.fn().mockRejectedValueOnce(new Error('сеть')).mockResolvedValue(undefined)
		const { state, edit } = setup('edit', preload)
		await vi.waitFor(() => expect(state.isLoadFailed.value).toBe(true))
		state.retry()
		expect(state.isLoadFailed.value).toBe(false)
		expect(preload).toHaveBeenCalledTimes(2)
		edit.isLoaded.value = true
		await vi.waitFor(() => expect(state.isEditing.value).toBe(true))
	})

	it('повтор не грузит интерфейс правки заново, если он уже загружен', async () => {
		const { state, preload, edit } = setup('edit')
		await vi.waitFor(() => expect(preload).toHaveBeenCalledTimes(1))
		await new Promise(resolve => setTimeout(resolve, 0))
		edit.error.value = true
		state.retry()
		expect(preload).toHaveBeenCalledTimes(1)
		expect(edit.retry).toHaveBeenCalledTimes(1)
	})

	it('вне режима «Правка» повтор интерфейс правки не грузит', () => {
		const { state, preload } = setup('review')
		state.retry()
		expect(preload).not.toHaveBeenCalled()
	})

	it('заблаговременная загрузка интерфейса правки при сбое молчит и не поднимает isLoadFailed', async () => {
		const preload = vi.fn(() => Promise.reject(new Error('сеть')))
		const { state, edit } = setup('view', preload, ['view', 'edit'])
		await vi.waitFor(() => expect(preload).toHaveBeenCalled(), { timeout: 3000 })
		await new Promise(resolve => setTimeout(resolve, 0))
		expect(edit.prefetch).toHaveBeenCalledTimes(1)
		expect(state.isLoadFailed.value).toBe(false)
	})
})
