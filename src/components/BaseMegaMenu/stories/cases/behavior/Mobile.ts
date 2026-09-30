import { expect } from 'storybook/test'
import type meta from '../../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Mobile: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Мобильный вид: уже `mobileBreakpoint` строка сворачивается в кнопку «Меню», разделы идут списком, панель',
					'раскрывается под разделом одной колонкой. В примере брейкпоинт `xxl`, чтобы вид был виден на любом экране.',
				].join('\n'),
			},
		},
	},
	args: { mobileBreakpoint: 'xxl', openKey: undefined },
	play: async ({ canvas, userEvent }) => {
		const toggle = canvas.getByRole('button', { name: 'Меню' })
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')
		await userEvent.click(toggle)
		await expect(toggle).toHaveAttribute('aria-expanded', 'true')
		await userEvent.click(canvas.getByRole('button', { name: 'Продукты' }))
		await expect(canvas.getByRole('link', { name: /Аналитика/ })).toBeVisible()
	},
}
