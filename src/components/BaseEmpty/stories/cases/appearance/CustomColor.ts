import { expect } from 'storybook/test'
import type meta from '../../BaseEmpty.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кастомный цвет через `color`: фон и текст. Токены роли дают акцентный блок, который меняется вместе с темой.',
			},
		},
	},
	args: {
		title: 'Скоро здесь появятся отчёты',
		description: 'Первый отчёт соберётся в понедельник, 19 мая.',
		icon: 'calendar',
		variant: 'soft',
		color: { bg: { base: 'var(--rise-primary-soft)' }, text: { base: 'var(--rise-primary-text)' } },
	},
	play: async ({ canvas }) => {
		const root = canvas.getByRole('heading', { name: 'Скоро здесь появятся отчёты' }).closest('.base-empty') as HTMLElement
		await expect(root.style.getPropertyValue('--custom-bg')).toBe('var(--rise-primary-soft)')
		await expect(getComputedStyle(root).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
	},
}
