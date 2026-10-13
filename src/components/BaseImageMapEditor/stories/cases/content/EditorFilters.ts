import { tabTo } from '@/stories/helpers'
import { IMAGE_MAP_FILTERS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import { expect, waitFor, within } from 'storybook/test'

export const EditorFilters: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель «Фильтры» правит `data.filters`: у каждого фильтра своя рамка с Id, названием, видом (флажки, метки, список, переключатели, «Открыто сейчас») и сочетанием вариантов.',
					'Варианты фильтра (значение — метка объекта, подпись) добавляются и удаляются внутри рамки; без вариантов фильтр работает по группам объектов.',
					'Пустое название, занятый Id и повторяющееся значение варианта — ошибка под полем, JSON не меняется; пробелы по краям убираются, когда поле теряет фокус.',
					'Кнопки работают с клавиатуры (Tab, Enter): после удаления фокус переходит на ближайшую строку или на «Добавить». Любую правку отменяет Ctrl+Z.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: IMAGE_MAP_FILTERS },
	play: async ({ canvas, userEvent }) => {
		canvas.getByRole('button', { name: 'Добавить этаж' }).focus()
		await expect(canvas.getByRole('group', { name: 'Тип' })).toBeVisible()
		await expect(canvas.getByText('Без вариантов фильтр работает по группам объектов')).toBeVisible()

		await tabTo(canvas.getByRole('button', { name: 'Добавить фильтр' }), userEvent, 60)
		await userEvent.keyboard('{Enter}')
		const added = canvas.getByRole('group', { name: 'Фильтр 3' })
		const title = within(added).getByLabelText('Название фильтра')
		await expect(title).toHaveValue('Фильтр 3')

		await userEvent.clear(title)
		await expect(within(added).getByText('Заполните поле')).toBeInTheDocument()
		await userEvent.type(title, 'Сервисы')
		const renamed = canvas.getByRole('group', { name: 'Сервисы' })

		await tabTo(within(renamed).getByRole('button', { name: 'Добавить вариант' }), userEvent, 20)
		await userEvent.keyboard('{Enter}')
		await expect(within(renamed).getByRole('group', { name: 'Вариант 1' })).toBeVisible()
		await tabTo(within(renamed).getByRole('button', { name: 'Удалить вариант «Вариант 1»' }), userEvent, 20)
		await userEvent.keyboard('{Enter}')
		await expect(within(renamed).queryByRole('group', { name: 'Вариант 1' })).not.toBeInTheDocument()
		await waitFor(() => expect(within(renamed).getByRole('button', { name: 'Добавить вариант' })).toHaveFocus())

		await tabTo(within(renamed).getByRole('button', { name: 'Удалить фильтр «Сервисы»' }), userEvent, 20)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.queryByRole('group', { name: 'Сервисы' })).not.toBeInTheDocument()
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Удалить фильтр «Категории»' })).toHaveFocus())
	},
}
