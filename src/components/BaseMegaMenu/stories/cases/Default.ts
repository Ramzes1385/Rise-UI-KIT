import { expect } from 'storybook/test'
import type meta from '../BaseMegaMenu.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: раскладка columns. Пункты с адресом — ссылки (BaseLink: RouterLink приложения или `<a href>`), клик',
					'эмитит `navigate` с адресом; узел «Интеграции» раскрывает вложенный уровень.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('link', { name: 'Документы' }))
		await expect(args.onNavigate).toHaveBeenCalledWith('/docs')

		const integrations = canvas.getByRole('button', { name: 'Интеграции' })
		await userEvent.click(integrations)
		await expect(integrations).toHaveAttribute('aria-expanded', 'true')
		await expect(canvas.getByRole('link', { name: 'Почта' })).toBeVisible()
	},
}
