import { makeMap } from '../utils/editorTestUtils'
import type { EditorContext } from '../../types/imageMapEditorInternal.types'
import { useEditorDeleteConfirm } from '../../model/document/useEditorDeleteConfirm'

function setup(isDisabled = false) {
	const data = makeMap()
	const ctx = {
		isDisabled: () => isDisabled,
		doc: { getData: () => data },
		selection: { getSelected: () => data.objects[0] },
	} as unknown as EditorContext
	const panel = { deleteSelected: vi.fn(), removeLayer: vi.fn(), removeGroup: vi.fn() }
	return { panel, confirm: useEditorDeleteConfirm(ctx, panel as never) }
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

	it('закрытие без вопроса ничего не делает', () => {
		const { confirm } = setup()
		expect(() => confirm.close(true)).not.toThrow()
	})
})
