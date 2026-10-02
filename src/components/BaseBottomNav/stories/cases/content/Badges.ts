import { expect } from 'storybook/test'
import { BADGE_ITEMS } from '../../shared'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Badges: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Счётчики на значках: число больше `maxBadge` — «99+»; строка — метка как есть. Бейдж скрыт от скринридера, вместо него у пункта описание (`aria-describedby`): «3 новых» или `badgeLabel`.',
			},
		},
	},
	args: { items: BADGE_ITEMS },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Чаты' })).toHaveAccessibleDescription('3 новых')
		const alerts = canvas.getByRole('button', { name: 'Уведомления' })
		await expect(alerts).toHaveTextContent('99+')
		await expect(alerts).toHaveAccessibleDescription('120 новых')
		await expect(canvas.getByRole('button', { name: 'Избранное' })).toHaveAccessibleDescription('Есть новое')
	},
}
