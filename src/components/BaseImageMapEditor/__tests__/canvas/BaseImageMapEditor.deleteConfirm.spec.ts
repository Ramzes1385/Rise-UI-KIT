import '@testing-library/jest-dom/vitest'
import { fireEvent, screen, waitFor, within } from '@testing-library/vue'
import { confirmDelete, lastModel, pressKey, renderEditor } from '../utils/editorTestUtils'

const deleteButton = (): HTMLElement => screen.getByRole('button', { name: 'Удалить (Delete)' })

describe('BaseImageMapEditor: подтверждение удаления', () => {
	it('кнопка «Удалить» спрашивает: вопрос с названием, пояснение про отмену; Escape отменяет и возвращает фокус', async () => {
		const { emitted } = renderEditor({ selected: 'r1' })
		deleteButton().focus()
		await fireEvent.click(deleteButton())

		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить объект «Зал»?' })
		expect(dialog).toHaveAccessibleDescription(/Ctrl\+Z/)
		await fireEvent.keyDown(dialog, { key: 'Escape' })

		await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
		expect(emitted()['update:modelValue']).toBeUndefined()
		await waitFor(() => expect(deleteButton()).toHaveFocus())
	})

	it('«Отмена» оставляет объект, «Удалить» убирает его и объявляет', async () => {
		const { container, emitted } = renderEditor({ selected: 'r1' })
		await fireEvent.click(deleteButton())
		await fireEvent.click(within(await screen.findByRole('alertdialog')).getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
		expect(emitted()['update:modelValue']).toBeUndefined()

		await fireEvent.click(deleteButton())
		await confirmDelete()
		expect(lastModel(emitted).objects.some(object => object.id === 'r1')).toBe(false)
		expect(container.querySelector('.base-image-map-editor__status')).toHaveTextContent('Удалён объект «Зал»')
	})

	it('Delete на холсте удаляет сразу, Ctrl+Z возвращает', async () => {
		const { emitted } = renderEditor({ selected: 'r1' })
		const canvas = screen.getByRole('application', { name: 'Холст карты' })

		pressKey(canvas, { key: 'Delete' })
		await waitFor(() => expect(lastModel(emitted).objects.some(object => object.id === 'r1')).toBe(false))
		expect(screen.queryByRole('alertdialog')).toBeNull()

		pressKey(canvas, { key: 'z', ctrlKey: true })
		await waitFor(() => expect(lastModel(emitted).objects.some(object => object.id === 'r1')).toBe(true))
	})

	it('этаж: вопрос с названием; отмена оставляет этаж, подтверждение удаляет', async () => {
		const { emitted } = renderEditor()
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить этаж «Второй»' }))
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить этаж «Второй»?' })
		expect(dialog).toHaveAccessibleDescription(/объекты и маршруты/)
		await fireEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
		expect(emitted()['update:modelValue']).toBeUndefined()

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить этаж «Второй»' }))
		await confirmDelete()
		expect(lastModel(emitted).layers.map(layer => layer.id)).toEqual(['l1'])
	})

	it('группа: вопрос с названием; отмена оставляет группу, подтверждение удаляет', async () => {
		const { emitted } = renderEditor()
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить группу «Магазины»' }))
		const dialog = await screen.findByRole('alertdialog', { name: 'Удалить группу «Магазины»?' })
		await fireEvent.click(within(dialog).getByRole('button', { name: 'Отмена' }))
		await waitFor(() => expect(screen.queryByRole('alertdialog')).toBeNull())
		expect(emitted()['update:modelValue']).toBeUndefined()

		await fireEvent.click(screen.getByRole('button', { name: 'Удалить группу «Магазины»' }))
		await confirmDelete()
		expect(lastModel(emitted).groups).toEqual([])
	})

	it('после подтверждённого удаления этажа фокус уходит на соседнюю строку', async () => {
		renderEditor()
		await fireEvent.click(screen.getByRole('button', { name: 'Удалить этаж «Первый»' }))
		await confirmDelete()

		await waitFor(() => expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Второй' })))
	})
})
