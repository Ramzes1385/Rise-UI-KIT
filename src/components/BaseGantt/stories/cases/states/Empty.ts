import { expect } from 'storybook/test'
import type meta from '../../BaseGantt.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Без задач (или если все они отброшены как неверные) — пустое состояние BaseEmpty; слот `empty` заменяет его содержимое, например кнопкой «Добавить задачу».',
			},
		},
	},
	args: { tasks: [], height: 320 },
	play: async ({ canvas }) => {
		await expect(canvas.getByText('Нет задач')).toBeVisible()
		await expect(canvas.queryByRole('treegrid')).not.toBeInTheDocument()
	},
}
