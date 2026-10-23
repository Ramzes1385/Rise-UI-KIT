import { expect } from 'storybook/test'
import type meta from '../BaseButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: меняйте props в панели Controls. Клик вызывает событие `click`.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить' }))
		await expect(args.onClick).toHaveBeenCalledOnce()
	},
}
