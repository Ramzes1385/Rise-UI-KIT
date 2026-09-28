import type meta from '../BaseLink.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const External: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Внешняя ссылка в новой вкладке: `rel="noopener noreferrer"`, стрелка и подсказка для скринридера.' },
		},
	},
	args: { to: undefined, href: 'https://example.com/guide', target: '_blank', label: 'Руководство по озвучке' },
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: /Руководство по озвучке/ })
		await expect(link).toHaveAttribute('rel', 'noopener noreferrer')
		await expect(link).toHaveAccessibleName('Руководство по озвучке (откроется в новой вкладке)')
		await expect(within(link).getByText('↗')).toHaveAttribute('aria-hidden', 'true')
	},
}
