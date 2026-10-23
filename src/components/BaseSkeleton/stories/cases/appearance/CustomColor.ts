import { expect } from 'storybook/test'
import type meta from '../../BaseSkeleton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Свой цвет фона `color` (строка CSS) — например, заглушка на цветной карточке. Здесь — токен мягкого основного цвета.',
			},
		},
	},
	args: { shape: 'rect', width: '100%', height: 64, color: 'var(--rise-primary-soft)' },
	play: async ({ canvasElement }) => {
		const skeleton = canvasElement.querySelector('.base-skeleton') as HTMLElement
		await expect(skeleton.style.backgroundColor).toBe('var(--rise-primary-soft)')
	},
}
