import { expect } from 'storybook/test'
import type meta from '../BaseForm.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: меняйте props в Controls. Кнопка `type="submit"` отправляет форму — приходит событие `submit`.',
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Подписаться' }))
		await expect(args.onSubmit).toHaveBeenCalledOnce()
	},
}
