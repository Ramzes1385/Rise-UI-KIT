import { expect } from 'storybook/test'
import { ONBOARDING } from '../../shared'
import type meta from '../../BaseChecklist.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Complete: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Все шаги выполнены: названия зачёркнуты, кнопок действий нет, внизу «Всё готово».' } } },
	args: { completed: ONBOARDING.map(item => item.id) },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('status')).toHaveTextContent('Всё готово')
		await expect(canvas.queryByRole('button')).toBeNull()
	},
}
