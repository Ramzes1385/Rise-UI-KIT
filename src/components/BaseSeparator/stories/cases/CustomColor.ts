import { expect } from 'storybook/test'
import type meta from '../BaseSeparator.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Кастомный цвет через `color`: `bg` — цвет линии, `text` — цвет подписи. Здесь — токен основного цвета,',
					'поэтому подпись контрастна в обеих темах: «новые сообщения» в ленте чата.',
				].join('\n'),
			},
		},
	},
	args: {
		label: 'Новые сообщения',
		color: { bg: { base: 'var(--rise-primary)' }, text: { base: 'var(--rise-primary)' } },
	},
	play: async ({ canvas }) => {
		const separator = canvas.getByRole('separator', { name: 'Новые сообщения' })
		const line = separator.querySelector('.base-separator__line') as HTMLElement
		const label = canvas.getByText('Новые сообщения')
		await expect(getComputedStyle(line).borderTopColor).toBe(getComputedStyle(label).color)
	},
}
