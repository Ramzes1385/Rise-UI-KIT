import type meta from '../BaseMegaMenu.stories'
import { expect, within } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: открыт раздел «Продукты» (`openKey`) — две колонки ссылок и промо-блок; он же текущий (`isActive`). Наведите на «Ресурсы» —',
					'панель переключится сразу; уведите курсор — закроется через `closeDelay`. «Цены» — раздел-ссылка.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('navigation', { name: 'Главное меню' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Продукты' })).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByRole('button', { name: 'Продукты' })).toHaveAttribute('aria-current', 'true')
		await expect(canvas.getByRole('button', { name: 'Ресурсы' })).toHaveAttribute('aria-expanded', 'false')
		await expect(canvas.getByRole('link', { name: /Аналитика/ })).toHaveAttribute('href', '/analytics')
		await expect(within(canvas.getByRole('link', { name: /Аналитика/ })).getByText('Новое')).toBeVisible()
		await expect(canvas.getByRole('link', { name: 'Цены' })).toHaveAttribute('href', '/pricing')
	},
}
