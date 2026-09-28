import type meta from '../BaseStepper.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: клик по шагу делает его текущим — значение синхронизировано с Controls.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('button', { name: /Доставка/ })).toHaveAttribute('aria-current', 'step')
		await userEvent.click(canvas.getByRole('button', { name: /Оплата/ }))
		await expect(args.onChange).toHaveBeenCalledWith(3)
		await waitFor(() => expect(canvas.getByRole('button', { name: /Оплата/ })).toHaveAttribute('aria-current', 'step'))
	},
}
