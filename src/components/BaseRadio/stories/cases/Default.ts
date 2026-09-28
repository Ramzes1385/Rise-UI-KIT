import { expect } from 'storybook/test'
import type meta from '../BaseRadio.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: выберите опцию или меняйте props в Controls — значение синхронизировано.' } } },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('radiogroup')).toHaveAccessibleName('Способ доставки')
		await userEvent.click(canvas.getByText('Самовывоз'))
		await expect(canvas.getByRole('radio', { name: 'Самовывоз' })).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledWith('pickup')
	},
}
