import { expect } from 'storybook/test'
import { LINK_ITEMS } from '../../shared'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Links: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Пункты-ссылки: `to` — маршрут приложения через компонент ссылок (здесь — заглушка RouterLink), `href` — внешний адрес. Приложение обычно связывает `v-model` с текущим маршрутом.',
			},
		},
	},
	args: { items: LINK_ITEMS, modelValue: 'calendar' },
	play: async ({ canvas, userEvent, args }) => {
		const calendar = canvas.getByRole('link', { name: 'Календарь' })
		await expect(calendar).toHaveAttribute('aria-current', 'page')
		await expect(calendar).toHaveAttribute('href', '/calendar')
		await expect(canvas.getByRole('link', { name: 'Справка' })).toHaveAttribute('rel', 'noopener noreferrer')

		const inbox = canvas.getByRole('link', { name: 'Входящие' })
		await userEvent.click(inbox)
		await expect(args.onNavigate).toHaveBeenCalledWith('/inbox')
		await expect(inbox).toHaveAttribute('aria-current', 'page')
	},
}
