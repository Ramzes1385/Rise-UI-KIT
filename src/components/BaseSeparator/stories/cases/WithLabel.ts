import { expect } from 'storybook/test'
import type meta from '../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithLabel: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Подпись между линиями: 12/16, приглушённый цвет. Подпись становится доступным именем разделителя.' },
		},
	},
	args: { label: 'или' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('separator', { name: 'или' })).toBeVisible()
	},
}
