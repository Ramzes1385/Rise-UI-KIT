import { expect } from 'storybook/test'
import { storyDate } from '@/stories/helpers'
import type meta from '../BaseCalendar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённый календарь: приглушён целиком, дни и кнопки шапки недоступны.' } } },
	args: { modelValue: storyDate(0, 0, 0), isDisabled: true },
	play: async ({ canvas }) => {
		for (const button of canvas.getAllByRole('button')) {
			await expect(button).toBeDisabled()
		}
	},
}
