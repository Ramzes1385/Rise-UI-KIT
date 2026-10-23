import { nextTick, reactive } from 'vue'
import { runInSetup } from '../../fixtures/model.test-utils'
import { useRoadmapStageEdit } from '../../../model/view/useRoadmapStageEdit'
import type { RoadmapStageEditProps } from '../../../types/internal/roadmap3dUi.types'

function mountEdit(customUrl = '') {
	const props = reactive({ title: 'Основы', customUrl })
	const emit = vi.fn()
	const { result } = runInSetup(() => useRoadmapStageEdit(props as unknown as RoadmapStageEditProps, emit as never))
	return { edit: result, props, emit }
}

describe('useRoadmapStageEdit', () => {
	it('черновик начинается с названия и идёт за ним', async () => {
		const { edit, props } = mountEdit()
		expect(edit.draft.value).toBe('Основы')
		props.title = 'Азы'
		await nextTick()
		expect(edit.draft.value).toBe('Азы')
	})

	it('commitTitle: новое название обрезается и уходит наружу', () => {
		const { edit, emit } = mountEdit()
		edit.setDraft('  Азы  ')
		edit.commitTitle()
		expect(emit).toHaveBeenCalledWith('rename', 'Азы')
	})

	it('пустое или прежнее название не отправляется, черновик возвращается', () => {
		const { edit, emit } = mountEdit()
		edit.setDraft('   ')
		edit.commitTitle()
		expect(edit.draft.value).toBe('Основы')
		edit.setDraft('Основы')
		edit.commitTitle()
		edit.setDraft(null)
		expect(edit.draft.value).toBe('')
		edit.setDraft(5)
		expect(edit.draft.value).toBe('5')
		expect(emit).not.toHaveBeenCalled()
	})

	it('onUrl: сообщает только о настоящем изменении', () => {
		const { edit, emit } = mountEdit('a.glb')
		edit.onUrl(' a.glb ')
		expect(emit).not.toHaveBeenCalled()
		edit.onUrl('b.glb')
		expect(emit).toHaveBeenCalledWith('url', 'b.glb')
		edit.onUrl(null)
		expect(emit).toHaveBeenLastCalledWith('url', '')
		expect(emit).toHaveBeenCalledTimes(2)
	})
})
