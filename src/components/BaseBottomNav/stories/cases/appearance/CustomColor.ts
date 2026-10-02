import { expect } from 'storybook/test'
import type meta from '../../BaseBottomNav.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Свой цвет через `color`: `bg.base` — фон панели, `text.base` — подписи, `bg.active` — значок и подложка выбранного пункта, `text.active` — его подпись. Для статусов берите токены ролей.',
			},
		},
	},
	args: {
		color: {
			bg: { base: 'var(--rise-primary-soft)', active: 'var(--rise-text-highlighted)' },
			text: { base: 'var(--rise-text)', active: 'var(--rise-text-highlighted)' },
		},
	},
	play: async ({ canvasElement }) => {
		const nav = canvasElement.querySelector('.base-bottom-nav') as HTMLElement
		await expect(nav.style.getPropertyValue('--custom-bg')).toBe('var(--rise-primary-soft)')
	},
}
