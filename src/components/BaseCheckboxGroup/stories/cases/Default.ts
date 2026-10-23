import { expect } from 'storybook/test'
import type meta from '../BaseCheckboxGroup.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Песочница: отмеченные значения попадают в `modelValue` (видно в Controls).' } } },
	play: async ({ canvas, userEvent, args }) => {
		await expect(canvas.getByRole('group', { name: 'Каналы уведомлений' })).toBeVisible()
		await userEvent.click(canvas.getByRole('checkbox', { name: 'Telegram' }))
		await expect(canvas.getByRole('checkbox', { name: 'Telegram' })).toBeChecked()
		await expect(args.onChange).toHaveBeenLastCalledWith(['email', 'telegram'])
		await expect(canvas.getByRole('checkbox', { name: /SMS/ })).toBeDisabled()
	},
}
