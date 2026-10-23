import { VISA_NUMBER } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab и Shift+Tab — по полям по порядку; Backspace в начале поля — к концу предыдущего; в поле номера — ничего.',
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const number = canvas.getByLabelText('Номер карты')
		const expiry = canvas.getByLabelText('Срок действия')
		const code = canvas.getByLabelText('Код')
		const holder = canvas.getByLabelText('Имя владельца')

		await userEvent.tab()
		await expect(number).toHaveFocus()
		await userEvent.tab()
		await expect(expiry).toHaveFocus()
		await userEvent.tab()
		await expect(code).toHaveFocus()
		await userEvent.tab()
		await expect(holder).toHaveFocus()
		await userEvent.tab({ shift: true })
		await expect(code).toHaveFocus()

		await userEvent.keyboard('{Backspace}')
		await waitFor(() => expect(expiry).toHaveFocus())
		await userEvent.keyboard('{Backspace}')
		await waitFor(() => expect(number).toHaveFocus())
		await userEvent.keyboard('{Backspace}')
		await expect(number).toHaveFocus()

		await userEvent.keyboard(VISA_NUMBER)
		await waitFor(() => expect(expiry).toHaveFocus())
		await userEvent.keyboard('12{Backspace}{Backspace}{Backspace}')
		await waitFor(() => expect(number).toHaveFocus())
		await expect(number).toHaveValue('4242 4242 4242 4242')
		await expect((number as HTMLInputElement).selectionStart).toBe(19)
	},
}
