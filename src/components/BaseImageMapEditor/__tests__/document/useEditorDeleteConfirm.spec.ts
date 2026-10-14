import { makeMap } from '../utils/editorTestUtils'
import type { EditorContext } from '../../types/imageMapEditorInternal.types'
import { useEditorDeleteConfirm } from '../../model/document/useEditorDeleteConfirm'

function setup(isDisabled = false) {
	const data = makeMap()
	const state = { isDisabled, selectedId: data.objects[0].id }
	const select = vi.fn((id: string | null) => {
		if (id) state.selectedId = id
	})
	const ctx = {
		isDisabled: () => state.isDisabled,
		doc: { getData: () => data },
		selection: { getSelected: () => data.objects.find(item => item.id === state.selectedId), select },
	} as unknown as EditorContext
	const panel = { deleteSelected: vi.fn(), removeLayer: vi.fn(), removeGroup: vi.fn() }
	return { data, state, select, panel, confirm: useEditorDeleteConfirm(ctx, panel as never) }
}

describe('useEditorDeleteConfirm', () => {
	it('подтверждение вызывает действие и возвращает true, отмена — false без действия', async () => {
		const { confirm, panel } = setup()

		const first = confirm.removeLayer('l1')
		expect(confirm.isOpen.value).toBe(true)
		expect(confirm.request.value?.title).toBe('Удалить этаж «Первый»?')
		confirm.close(true)
		expect(await first).toBe(true)
		expect(panel.removeLayer).toHaveBeenCalledWith('l1')
		expect(confirm.isOpen.value).toBe(false)

		const second = confirm.removeGroup('g1')
		confirm.close(false)
		expect(await second).toBe(false)
		expect(panel.removeGroup).not.toHaveBeenCalled()
	})

	it('новый вопрос отменяет прежний, который ещё ждёт ответа', async () => {
		const { confirm, panel } = setup()

		const first = confirm.deleteSelected()
		const second = confirm.removeGroup('g1')

		expect(await first).toBe(false)
		confirm.close(true)
		expect(await second).toBe(true)
		expect(panel.deleteSelected).not.toHaveBeenCalled()
		expect(panel.removeGroup).toHaveBeenCalledWith('g1')
	})

	it('неизвестный этаж и группа, а также отключённый редактор — без вопроса', async () => {
		const { confirm } = setup()
		expect(await confirm.removeLayer('нет')).toBe(false)
		expect(await confirm.removeGroup('нет')).toBe(false)
		expect(confirm.isOpen.value).toBe(false)

		const disabled = setup(true)
		expect(await disabled.confirm.deleteSelected()).toBe(false)
		expect(disabled.confirm.isOpen.value).toBe(false)
	})

	it('после подтверждения перепроверяется отключение: ничего не удаляется', async () => {
		const { confirm, panel, state } = setup()

		const result = confirm.removeLayer('l1')
		state.isDisabled = true
		confirm.close(true)

		expect(await result).toBe(false)
		expect(panel.removeLayer).not.toHaveBeenCalled()
	})

	it('удаляется объект из вопроса, а не текущее выделение', async () => {
		const { confirm, panel, state, select, data } = setup()
		const asked = data.objects[0]

		const result = confirm.deleteSelected()
		expect(confirm.request.value?.title).toContain(asked.title)
		state.selectedId = data.objects[1].id
		confirm.close(true)

		expect(await result).toBe(true)
		expect(select).toHaveBeenCalledWith(asked.id)
		expect(panel.deleteSelected).toHaveBeenCalledOnce()
	})

	it('если названного объекта уже нет, удаление не выполняется; выделение не трогается, когда оно совпадает', async () => {
		const first = setup()
		const pending = first.confirm.deleteSelected()
		first.confirm.close(true)
		await pending
		expect(first.select).not.toHaveBeenCalled()
		expect(first.panel.deleteSelected).toHaveBeenCalledOnce()

		const second = setup()
		const gone = second.confirm.deleteSelected()
		second.data.objects.splice(0, 1)
		second.confirm.close(true)
		await gone
		expect(second.panel.deleteSelected).not.toHaveBeenCalled()
	})

	it('закрытие без вопроса ничего не делает', () => {
		const { confirm } = setup()
		expect(() => confirm.close(true)).not.toThrow()
	})
})
