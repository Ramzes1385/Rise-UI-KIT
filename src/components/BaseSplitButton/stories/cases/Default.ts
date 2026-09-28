import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseSplitButton.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: основное действие и меню других.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Сохранить' }))
		await expect(args.onClick).toHaveBeenCalledTimes(1)
		await userEvent.click(canvas.getByRole('button', { name: 'Другие действия' }))
		const item = await waitFor(() => document.querySelector('[role="menuitem"]') as HTMLElement)
		await userEvent.click(item)
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: 'Сохранить как черновик' }), expect.anything())
	},
}
