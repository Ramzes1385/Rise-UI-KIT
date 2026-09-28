import { expect } from 'storybook/test'
import type meta from '../BaseLink.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const UnsafeUrl: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Небезопасный адрес из данных (`javascript:`) не попадает в `href`: ссылка отключена, в консоли — предупреждение.',
			},
		},
	},
	args: { to: undefined, href: 'javascript:alert(1)', label: 'Ссылка из комментария' },
	play: async ({ canvas }) => {
		const link = canvas.getByRole('link', { name: 'Ссылка из комментария' })
		await expect(link).not.toHaveAttribute('href')
		await expect(link).toHaveAttribute('aria-disabled', 'true')
	},
}
