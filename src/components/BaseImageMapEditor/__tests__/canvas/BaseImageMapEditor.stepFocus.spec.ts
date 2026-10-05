import '@testing-library/jest-dom/vitest'
import { nextTick } from 'vue'
import userEvent from '@testing-library/user-event'
import { fireEvent, screen, within } from '@testing-library/vue'
import { lastModel, makeMap, renderEditor } from '../utils/editorTestUtils'

function button(name: string): HTMLElement {
	return screen.getByRole('button', { name })
}

function zoomButton(name: string): HTMLElement {
	const toolbar = document.querySelector('.base-image-map-editor__toolbar') as HTMLElement
	return within(within(toolbar).getByRole('group', { name: 'Масштаб' })).getByRole('button', { name })
}

function expectFocusedAtLimit(element: HTMLElement): void {
	expect(element).toHaveFocus()
	expect(element).toHaveAttribute('aria-disabled', 'true')
	expect(element).not.toHaveAttribute('disabled')
}

describe('BaseImageMapEditor — кнопки-шаги на пределе остаются в фокусе', () => {
	it('«Отменить» после последнего шага истории — в фокусе, повторное нажатие ничего не меняет', async () => {
		const user = userEvent.setup()
		const { emitted } = renderEditor({ selected: 'r1' })
		await fireEvent.click(button('Удалить (Delete)'))
		const undo = button('Отменить (Ctrl+Z)')
		undo.focus()
		await user.keyboard('{Enter}')
		expect(lastModel(emitted).objects.some(object => object.id === 'r1')).toBe(true)
		expectFocusedAtLimit(undo)
		const count = emitted()['update:modelValue']?.length
		await user.keyboard('{Enter}')
		expect(emitted()['update:modelValue']).toHaveLength(count as number)
		const redo = button('Повторить (Ctrl+Shift+Z)')
		redo.focus()
		await user.keyboard('{Enter}')
		expectFocusedAtLimit(redo)
	})

	it('«Удалить» снимает выделение и остаётся в фокусе', async () => {
		const user = userEvent.setup()
		renderEditor({ selected: 'r1' })
		const remove = button('Удалить (Delete)')
		remove.focus()
		await user.keyboard('{Enter}')
		expectFocusedAtLimit(remove)
		expect(button('Дублировать (Ctrl+D)')).toHaveAttribute('aria-disabled', 'true')
	})

	it('масштаб холста: «Увеличить» на 400 % и «Уменьшить» на 100 % — в фокусе', async () => {
		const user = userEvent.setup()
		renderEditor()
		const zoomIn = zoomButton('Увеличить')
		zoomIn.focus()
		for (let index = 0; index < 7; index++) await user.keyboard('{Enter}')
		expectFocusedAtLimit(zoomIn)
		const zoomOut = zoomButton('Уменьшить')
		zoomOut.focus()
		for (let index = 0; index < 7; index++) await user.keyboard('{Enter}')
		expectFocusedAtLimit(zoomOut)
	})

	it('«Выше» и «Ниже» этажа: после перестановки на край кнопка остаётся в фокусе', async () => {
		const user = userEvent.setup()
		const { emitted } = renderEditor()
		const up = button('Выше: «Второй»')
		up.focus()
		await user.keyboard('{Enter}')
		await nextTick()
		expect(lastModel(emitted).layers.map(layer => layer.id)).toEqual(['l2', 'l1'])
		expectFocusedAtLimit(button('Выше: «Второй»'))
		const down = button('Ниже: «Второй»')
		down.focus()
		await user.keyboard('{Enter}')
		await nextTick()
		expect(lastModel(emitted).layers.map(layer => layer.id)).toEqual(['l1', 'l2'])
		expectFocusedAtLimit(button('Ниже: «Второй»'))
	})

	it('isDisabled — у кнопок-шагов нативный disabled', () => {
		renderEditor({ modelValue: makeMap(), selected: 'r1', isDisabled: true })
		for (const name of ['Отменить (Ctrl+Z)', 'Повторить (Ctrl+Shift+Z)', 'Удалить (Delete)', 'Выше: «Второй»']) {
			expect(button(name)).toBeDisabled()
			expect(button(name)).not.toHaveAttribute('aria-disabled')
		}
	})
})
