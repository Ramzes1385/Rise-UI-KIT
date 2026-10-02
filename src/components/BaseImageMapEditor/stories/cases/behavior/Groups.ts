import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseImageMapEditor.stories'

export const Groups: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Панель «Группы»: у каждой группы — своя рамка с полями (название, цвет, значок) и кнопкой удаления.',
					'«Добавить группу» создаёт «Группа N»; объекту группа назначается полем «Группа» в его свойствах.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('group', { name: 'Кафе и рестораны' })).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Добавить группу' }))
		const added = canvas.getByRole('group', { name: 'Группа 4' })
		const title = within(added).getByLabelText('Название группы')
		await expect(title).toHaveValue('Группа 4')

		await userEvent.clear(title)
		await userEvent.type(title, 'Парковки')
		await expect(canvas.getByRole('group', { name: 'Парковки' })).toBeVisible()

		await userEvent.click(canvas.getByRole('button', { name: 'Удалить группу «Парковки»' }))
		await expect(canvas.queryByRole('group', { name: 'Парковки' })).not.toBeInTheDocument()
		await expect(canvas.getByRole('group', { name: 'Сервис' })).toBeVisible()
	},
}
