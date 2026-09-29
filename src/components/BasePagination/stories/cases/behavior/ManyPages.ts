import { expect } from 'storybook/test'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const ManyPages: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Много страниц: вокруг текущей — соседние номера, по краям — первая и последняя, разрывы заменяет «…».' },
		},
	},
	args: { modelValue: 25, total: 500 },
	play: async ({ canvas }) => {
		await expect(canvas.getAllByText('…')).toHaveLength(2)
		await expect(canvas.getByRole('button', { name: '50' })).toBeVisible()
	},
}
