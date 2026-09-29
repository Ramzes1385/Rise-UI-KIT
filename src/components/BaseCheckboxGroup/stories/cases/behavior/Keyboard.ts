import { expect } from 'storybook/test'
import { tabTo } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseCheckboxGroup.stories'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Клавиатура: Tab переходит по флажкам (недоступный пропускается), пробел отмечает.' } } },
	tags: ['!autodocs'],
	args: { modelValue: [] },
	play: async ({ canvas, userEvent, args }) => {
		const email = canvas.getByRole('checkbox', { name: 'Электронная почта' })
		await tabTo(email, userEvent)
		await userEvent.keyboard(' ')
		await expect(args.onChange).toHaveBeenLastCalledWith(['email'])
		await userEvent.tab()
		await expect(canvas.getByRole('checkbox', { name: 'Push-уведомления' })).toHaveFocus()
	},
}
