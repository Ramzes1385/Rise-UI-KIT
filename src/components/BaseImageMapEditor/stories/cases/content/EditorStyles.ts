import { tabTo } from '@/stories/helpers'
import { IMAGE_MAP_STYLES } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'
import { expect, waitFor, within } from 'storybook/test'

export const EditorStyles: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель «Стили» правит именованные стили `data.styles`: имя, заливка, обводка, её толщина и непрозрачность заливки.',
					'Цвет выбирается из палитры токенов `--rise-*` («Заливка: из палитры») или вводится своим значением в поле «Заливка» («Обводка»).',
					'Переименование стиля переносит ссылки на него у объектов и групп, удаление снимает их. Объект и группа выбирают стиль списком «Стиль».',
					'Состояния `hover` и `active` стиля сохраняются в JSON, но в панели не правятся. Кнопки работают с клавиатуры (Tab, Enter).',
				].join('\n'),
			},
		},
	},
	args: { modelValue: IMAGE_MAP_STYLES },
	play: async ({ canvas, userEvent }) => {
		canvas.getByRole('button', { name: 'Добавить этаж' }).focus()
		await expect(canvas.getByRole('group', { name: 'accent' })).toBeVisible()

		await tabTo(canvas.getByRole('button', { name: 'Добавить стиль' }), userEvent, 60)
		await userEvent.keyboard('{Enter}')
		const added = canvas.getByRole('group', { name: 'style-1' })
		const name = within(added).getByLabelText('Имя стиля')
		await userEvent.clear(name)
		await userEvent.type(name, 'accent')
		await expect(within(added).getByText('Такое имя уже есть')).toBeInTheDocument()
		await userEvent.type(name, '-warm')
		const renamed = canvas.getByRole('group', { name: 'accent-warm' })

		const fill = within(renamed).getByLabelText('Заливка')
		await userEvent.click(fill)
		await userEvent.type(fill, 'var(--rise-warning)')
		await expect(fill).toHaveValue('var(--rise-warning)')

		await tabTo(within(renamed).getByRole('button', { name: 'Удалить стиль «accent-warm»' }), userEvent, 20)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.queryByRole('group', { name: 'accent-warm' })).not.toBeInTheDocument()
		await waitFor(() => expect(canvas.getByRole('button', { name: 'Удалить стиль «calm»' })).toHaveFocus())
	},
}
