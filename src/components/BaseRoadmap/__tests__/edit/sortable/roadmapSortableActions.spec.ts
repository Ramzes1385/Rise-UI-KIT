import { ref } from 'vue'
import { mountEdit } from '../fixtures/editFixtures'
import { UI_ROADMAP_EDIT } from '@/locales/messages'
import { createSortableActions } from '../../../model/edit/sortable/roadmapSortableActions'

function setup() {
	const mounted = mountEdit()
	const root = document.createElement('div')
	root.innerHTML = '<button data-roadmap-handle="b"></button><button data-roadmap-handle="s2"></button>'
	document.body.append(root)
	const rootRef = ref<HTMLElement | null>(root)
	const actions = createSortableActions({ rootRef, edit: mounted.edit, isDisabled: () => false })
	return { ...mounted, actions, root, rootRef }
}

afterEach(() => {
	document.body.innerHTML = ''
})

describe('действия перестановки', () => {
	it('preview строит черновик перемещения и не трогает данные; без изменения места черновика нет', () => {
		const { actions, edit, data } = setup()
		actions.preview('a', { stage: 's1', index: 0 })
		expect(edit.draft.value).toBeNull()
		actions.preview('a', { stage: 's2', index: 0 })
		expect(edit.draft.value?.stages[1].topics.map(item => item.id)).toEqual(['a', 'd', 'e'])
		expect(data.value.stages[1].topics.map(item => item.id)).toEqual(['d', 'e'])
		actions.preview('s1', 2)
		expect(edit.draft.value?.stages.map(item => item.id)).toEqual(['s2', 's3', 's1'])
	})

	it('drop применяет итоговое место черновика одним перемещением и очищает черновик', async () => {
		const { actions, edit, data, emitted } = setup()
		const done = vi.fn()
		actions.preview('a', { stage: 's2', index: 1 })
		await actions.drop({ id: 'a', kind: 'topic' }, done)
		expect(edit.draft.value).toBeNull()
		expect(data.value.stages[1].topics.map(item => item.id)).toEqual(['d', 'a', 'e'])
		expect(edit.history.list()).toHaveLength(1)
		expect(emitted('reorder')).toHaveLength(1)
		expect(done).toHaveBeenCalledOnce()
		actions.preview('s3', 0)
		await actions.drop({ id: 's3', kind: 'stage' }, done)
		expect(data.value.stages.map(item => item.id)).toEqual(['s3', 's1', 's2'])
	})

	it('drop без черновика или если элемент пропал из него — только done', async () => {
		const { actions, edit, data } = setup()
		const done = vi.fn()
		const before = data.value
		await actions.drop({ id: 'a', kind: 'topic' }, done)
		edit.draft.value = { ...data.value, stages: [] }
		await actions.drop({ id: 'a', kind: 'topic' }, done)
		expect(done).toHaveBeenCalledTimes(2)
		expect(data.value).toBe(before)
		expect(edit.draft.value).toBeNull()
	})

	it('cancel сбрасывает черновик', () => {
		const { actions, edit } = setup()
		const done = vi.fn()
		actions.preview('s1', 2)
		actions.cancel(done)
		expect(edit.draft.value).toBeNull()
		expect(done).toHaveBeenCalledOnce()
	})

	it('объявления: взят этап, взята тема, новое место; неизвестный элемент — по id, место неизвестного молчит', () => {
		const { actions, edit } = setup()
		actions.announce('PICKED', 's1', 'stage')
		expect(edit.liveText.value).toBe('Этап «Этап s1» взят. Стрелки — переместить, пробел — положить, Escape — отмена')
		actions.announce('PICKED', 'b', 'topic')
		expect(edit.liveText.value).toContain('Тема «Тема b» взята')
		actions.announce('PICKED', 'ghost', 'topic')
		expect(edit.liveText.value).toContain('«ghost»')
		actions.announce('MOVED', 's2', 'stage')
		expect(edit.liveText.value).toBe('Этап «Этап s2»: место 2 из 3')
		actions.announce('MOVED', 'e', 'topic')
		expect(edit.liveText.value).toBe('Тема «Тема e»: этап «Этап s2», место 2 из 2')
		const text = edit.liveText.value
		actions.announce('MOVED', 'ghost', 'topic')
		expect(edit.liveText.value).toBe(text)
	})

	it('MOVED у темы без совпадения вида берёт id вместо названия', () => {
		const { actions, edit } = setup()
		actions.announce('MOVED', 's1', 'topic')
		expect(edit.liveText.value).toContain('Тема «s1»')
		expect(UI_ROADMAP_EDIT.MOVED_TOPIC).toContain('{title}')
	})

	it('moveBy двигает этап и тему на шаг, возвращает фокус на рукоять; на краю ничего не делает', async () => {
		const { actions, data, root } = setup()
		await actions.moveBy('b', 1)
		expect(data.value.stages[0].topics.map(item => item.id)).toEqual(['a', 'c', 'b'])
		await vi.waitFor(() => expect(document.activeElement).toBe(root.querySelector('[data-roadmap-handle="b"]')))
		await actions.moveBy('s2', -1)
		expect(data.value.stages.map(item => item.id)).toEqual(['s2', 's1', 's3'])
		await vi.waitFor(() => expect(document.activeElement).toBe(root.querySelector('[data-roadmap-handle="s2"]')))
		const length = data.value.stages.length
		await actions.moveBy('s2', -1)
		await actions.moveBy('ghost', 1)
		expect(data.value.stages).toHaveLength(length)
	})

	it('focusHandle без корня или рукояти ничего не ломает', async () => {
		const { actions, rootRef } = setup()
		actions.focusHandle('нет')
		rootRef.value = null
		actions.focusHandle('b')
		await Promise.resolve()
		expect(document.activeElement).toBe(document.body)
	})
})
