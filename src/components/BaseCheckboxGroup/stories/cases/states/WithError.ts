import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'

export const WithError: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Ошибка: текст под флажками описывает группу (`aria-describedby`).' } } },
	args: { modelValue: [], isRequired: true, error: 'Выберите хотя бы один канал' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('group', { name: 'Каналы уведомлений' })).toHaveAccessibleDescription('Выберите хотя бы один канал')
	},
}
