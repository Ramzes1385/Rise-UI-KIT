import { expect } from 'storybook/test'
import type meta from '../../BaseButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Отключённая кнопка: приглушена, не получает фокус, клик не вызывает событие.' } } },
	args: { isDisabled: true, default: 'Недоступно' },
	play: async ({ canvas, userEvent, args }) => {
		const button = canvas.getByRole('button', { name: 'Недоступно' })
		await expect(button).toBeDisabled()
		await userEvent.click(button)
		await expect(args.onClick).not.toHaveBeenCalled()
	},
}
