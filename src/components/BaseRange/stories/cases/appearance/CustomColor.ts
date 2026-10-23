import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg` красит заполнение и бегунок (кольцо и заливка), `text` — значение в подписи.',
					'Для текста взят токен текста роли (`--rise-success-text`): он контрастен и в светлой, и в тёмной теме.',
				].join('\n'),
			},
		},
	},
	args: { modelValue: 70, hasLabel: true, color: { bg: { base: '#16a34a' }, text: { base: 'var(--rise-success-text)' } } },
	play: async ({ canvas }) => {
		const thumb = canvas.getByRole('slider', { name: 'Громкость' })
		await expect(getComputedStyle(thumb).borderTopColor).toBe('rgb(22, 163, 74)')
		await expect(getComputedStyle(thumb).backgroundColor).toBe('rgb(22, 163, 74)')
	},
}
