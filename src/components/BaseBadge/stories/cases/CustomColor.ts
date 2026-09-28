import { expect } from 'storybook/test'
import type meta from '../BaseBadge.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color` — например, фирменный цвет тарифа. Для статусов берите токены ролей (см. «Статусы»).',
			},
		},
	},
	args: {
		label: 'Pro',
		color: { bg: { base: '#6d28d9' }, text: { base: '#ffffff' } },
	},
	play: async ({ canvas }) => {
		const badge = canvas.getByText('Pro').closest('.base-badge') as HTMLElement
		await expect(getComputedStyle(badge).backgroundColor).toBe('rgb(109, 40, 217)')
		await expect(getComputedStyle(badge).color).toBe('rgb(255, 255, 255)')
	},
}
