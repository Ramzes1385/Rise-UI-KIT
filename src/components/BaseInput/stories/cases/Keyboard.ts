import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type meta from '../BaseInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Клавиатура: Tab ставит фокус в поле (видно кольцо фокуса), ввод меняет значение.' } } },
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Email')
		await tabTo(field, userEvent)
		const wrapper = field.closest('.base-input__wrapper') as HTMLElement
		await expect(getComputedStyle(wrapper).boxShadow).not.toBe('none')
		await userEvent.keyboard('ivan@example.com')
		await expect(field).toHaveValue('ivan@example.com')
	},
}
