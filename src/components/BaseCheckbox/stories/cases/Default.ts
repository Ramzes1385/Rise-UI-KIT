import { expect } from 'storybook/test'
import type meta from '../BaseCheckbox.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Песочница: кликните по подписи или меняйте props в Controls — значение синхронизировано.' } },
	},
	play: async ({ canvas, userEvent, args }) => {
		const checkbox = canvas.getByRole('checkbox', { name: 'Получать новости и специальные предложения' })
		await userEvent.click(canvas.getByText('Получать новости и специальные предложения'))
		await expect(checkbox).toBeChecked()
		await expect(args.onChange).toHaveBeenCalledWith(true)
	},
}
