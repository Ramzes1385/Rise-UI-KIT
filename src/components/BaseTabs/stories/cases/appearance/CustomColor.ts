import { expect } from 'storybook/test'
import type meta from '../../BaseTabs.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `text.base` — неактивные вкладки, `text.active` — активная,',
					'`bg.active` — линия (underline, arc) или «пилюля» (pills, rounded) активной вкладки, `bg.base` — фон контейнера.',
				].join('\n'),
			},
		},
	},
	args: {
		modelValue: 'specs',
		variant: 'pills',
		color: {
			bg: { base: '#eff6ff', active: '#2563eb' },
			text: { base: '#1e40af', active: '#ffffff' },
		},
	},
	play: async ({ canvas }) => {
		const active = canvas.getByRole('tab', { name: 'Характеристики' })
		await expect(getComputedStyle(active).backgroundColor).toBe('rgb(37, 99, 235)')
		await expect(getComputedStyle(active).color).toBe('rgb(255, 255, 255)')
		await expect(getComputedStyle(canvas.getByRole('tab', { name: 'Обзор' })).color).toBe('rgb(30, 64, 175)')
		await expect(getComputedStyle(canvas.getByRole('tablist')).backgroundColor).toBe('rgb(239, 246, 255)')
	},
}
