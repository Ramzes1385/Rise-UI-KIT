import { expect } from 'storybook/test'
import type meta from '../BaseForm.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Клавиатура: Tab переводит фокус между полями, Enter в поле отправляет форму.' } } },
	tags: ['!autodocs'],
	play: async ({ canvas, userEvent, args }) => {
		const email = canvas.getByLabelText('Email')
		await userEvent.click(canvas.getByLabelText('Имя'))
		await userEvent.tab()
		await expect(email).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(args.onSubmit).toHaveBeenCalledOnce()
	},
}
