import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseCardInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { AMEX_NUMBER, CARD_SAMPLES } from '../../shared'

const MIR_NUMBER = CARD_SAMPLES.find(sample => sample.id === 'mir')?.number ?? ''

export const Accepted: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Принимаемые марки `brands`: здесь только Мир, Visa и Mastercard. Карта другой марки распознаётся, но после ухода',
					'из поля — ошибка «Карты … не принимаются», и `isComplete` остаётся `false`. Проверьте с American Express 3782 822463 10005.',
				].join('\n'),
			},
		},
	},
	args: { brands: ['mir', 'visa', 'mastercard'] },
	play: async ({ canvas, userEvent }) => {
		const number = canvas.getByLabelText('Номер карты')
		await userEvent.click(number)
		await userEvent.keyboard(AMEX_NUMBER)
		await expect(canvas.getByRole('img', { name: 'Марка карты: American Express' })).toBeVisible()
		await userEvent.tab()
		await waitFor(() => expect(number).toHaveAccessibleDescription('Карты American Express не принимаются'))

		await userEvent.clear(number)
		await userEvent.paste(MIR_NUMBER)
		await expect(canvas.getByRole('img', { name: 'Марка карты: Мир' })).toBeVisible()
		await userEvent.tab()
		await waitFor(() => expect(canvas.queryByText('Карты American Express не принимаются')).toBeNull())
	},
}
