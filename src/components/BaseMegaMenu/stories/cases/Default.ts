import { expect } from 'storybook/test'
import type meta from '../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: открыт раздел «Продукты» (`openKey`) — две колонки ссылок и промо-блок. Наведите на «Ресурсы» —',
					'панель переключится сразу; уведите курсор — закроется через `closeDelay`. «Цены» — раздел-ссылка.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('navigation', { name: 'Главное меню' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Продукты' })).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByRole('button', { name: 'Ресурсы' })).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.getByRole('link', { name: /Аналитика/ })).toHaveAttribute('href', '/analytics')
		await expect(canvas.getByRole('link', { name: 'Цены' })).toHaveAttribute('href', '/pricing')
	},
}
