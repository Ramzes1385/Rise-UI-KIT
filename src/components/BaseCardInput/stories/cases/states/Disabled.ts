import { expect } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Отключённая группа: `fieldset disabled`, поля не получают фокус и не принимают ввод.' } },
	},
	args: { isDisabled: true },
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('group', { name: 'Оплата картой' })).toBeDisabled()
		for (const label of ['Номер карты', 'Срок действия', 'Код', 'Имя владельца'])
			await expect(canvas.getByLabelText(label)).toBeDisabled()
		await userEvent.tab()
		await expect(canvas.getByLabelText('Номер карты')).not.toHaveFocus()
	},
}
