import { expect } from 'storybook/test'
import type meta from '../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithoutLastPage: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: '`showLastPage: false` — последняя страница не показывается: удобно, когда общее число страниц неизвестно или огромно.',
			},
		},
	},
	args: { modelValue: 3, total: 500, showLastPage: false },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: '50' })).toBeNull()
	},
}
