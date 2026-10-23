import { expect } from 'storybook/test'
import type meta from '../BaseSegmented.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: клик выбирает сегмент, недоступный не выбирается.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('radiogroup', { name: 'Период отчёта' })).toBeVisible()
		await userEvent.click(canvas.getByText('Месяц'))
		await expect(args.onChange).toHaveBeenLastCalledWith('month')
		await expect(canvas.getByRole('radio', { name: 'Месяц' })).toBeChecked()
		await expect(canvas.getByRole('radio', { name: 'Год' })).toBeDisabled()
	},
}
