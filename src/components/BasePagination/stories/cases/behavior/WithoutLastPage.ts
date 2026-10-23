import { expect } from 'storybook/test'
import type meta from '../../BasePagination.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithoutLastPage: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'`showLastPage: false` — последняя страница не показывается: удобно, когда общее число страниц неизвестно или огромно.',
					'Окно номеров шире на одну кнопку, справа «…», пока дальше есть страницы; у последней страницы окно доходит до неё.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 3, total: 500, showLastPage: false },
	play: async ({ canvas }) => {
		await expect(canvas.queryByRole('button', { name: 'Страница 50' })).toBeNull()
		await expect(canvas.getByRole('button', { name: 'Страница 7' })).toBeVisible()
	},
}
