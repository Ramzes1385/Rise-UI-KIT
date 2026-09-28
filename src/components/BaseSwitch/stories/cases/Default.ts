import { expect } from 'storybook/test'
import type meta from '../BaseSwitch.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: кликните по переключателю или меняйте props в Controls — значение синхронизировано.' } },
	},
	play: async ({ canvas, userEvent, args }) => {
		const toggle = canvas.getByRole('switch', { name: 'Уведомления по email' })
		await userEvent.click(toggle)
		await expect(toggle).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledWith(true)
	},
}
