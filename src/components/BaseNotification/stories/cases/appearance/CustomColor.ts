import { expect, within } from 'storybook/test'
import { resolveColor } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseNotification.stories'

export const CustomColor: StoryObj<typeof meta> = {
	args: {
		type: 'info',
		title: 'Новый участник',
		description: 'Мария Кузнецова присоединилась к проекту.',
		color: {
			bg: { base: 'var(--rise-primary-soft)', hover: 'var(--rise-primary-soft-hover)' },
			text: { base: 'var(--rise-primary-text)' },
		},
	},
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: фон и текст уведомления. Подойдёт любой CSS-цвет; токены `var(--rise-…)` сохраняют',
					'контраст в обеих темах. Иконка и полоса прогресса сохраняют цвет типа.',
				].join('\n'),
			},
		},
		controls: { include: ['color', 'type', 'sizeScale'] },
	},
	play: async ({ canvas }) => {
		const item = await canvas.findByRole('status')
		await expect(getComputedStyle(item).backgroundColor).toBe(resolveColor('var(--rise-primary-soft)'))
		await expect(getComputedStyle(within(item).getByText('Новый участник')).color).toBe(resolveColor('var(--rise-primary-text)'))
	},
}
