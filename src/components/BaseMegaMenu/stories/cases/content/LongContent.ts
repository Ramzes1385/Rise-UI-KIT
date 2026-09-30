import { expect } from 'storybook/test'
import { LONG_ITEMS } from '../../shared'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Длинные названия и много колонок: разделы переносятся на вторую строку, панель делит ширину на четыре колонки,',
					'длинные ссылки и пояснения переносятся по словам.',
				].join('\n'),
			},
		},
	},
	args: { items: LONG_ITEMS, openKey: 'catalog' },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: /Сухие строительные смеси/ })).toBeVisible()
		await expect(canvas.getByRole('list', { name: 'Свет' })).toBeVisible()
	},
}
