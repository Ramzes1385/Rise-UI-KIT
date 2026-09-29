import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab ставит фокус в поле (видно кольцо фокуса), Enter переносит строку, а не отправляет форму.',
			},
		},
	},
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Комментарий к заказу')
		await tabTo(field, userEvent)
		await expect(getComputedStyle(field).boxShadow).not.toBe('none')
		await userEvent.keyboard('Подъезд 2{Enter}Этаж 5')
		await expect(field).toHaveValue('Подъезд 2\nЭтаж 5')
	},
}
