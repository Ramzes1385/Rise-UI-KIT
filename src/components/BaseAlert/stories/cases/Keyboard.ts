import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseAlert.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab переводит фокус на «Закрыть», Enter закрывает. На заливке роли кольцо фокуса — цвета текста,',
					'чтобы не слиться с фоном.',
				].join('\n'),
			},
		},
	},
	tags: ['!autodocs'],
	args: { isClosable: true },
	play: async ({ canvas, userEvent, args }) => {
		const close = canvas.getByRole('button', { name: 'Закрыть' })
		await tabTo(close, userEvent)
		await expect(getComputedStyle(close).outlineStyle).toBe('solid')
		await expect(getComputedStyle(close).outlineColor).toBe(getComputedStyle(canvas.getByRole('status')).color)
		await userEvent.keyboard('{Enter}')
		await expect(args.onClose).toHaveBeenCalledOnce()
	},
}
