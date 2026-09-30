import type meta from '../BasePhoneInput.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { PHONE_SOURCE, renderPhone } from '../shared'
import { expect, waitFor, within } from 'storybook/test'

export const Countries: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Список стран: флаг, название на языке кита и код. Открывается кликом, стрелками, Enter или пробелом, плавно',
					'вырастает из поля; буквы ищут страну по названию, Enter выбирает, Escape закрывает. Проверка выбирает Беларусь',
					'с клавиатуры и снова открывает список.',
				].join(' '),
			},
			source: PHONE_SOURCE,
		},
	},
	args: { modelValue: '+79161234567' },
	render: renderPhone,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const country = canvas.getByRole('combobox', { name: 'Код страны' })
		const page = within(canvasElement.ownerDocument.body)
		await userEvent.click(country)
		const belarus = await page.findByRole('option', { name: 'Беларусь +375' })
		await waitFor(() => expect(belarus).toBeVisible())
		await userEvent.keyboard('Б')
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(country).toHaveTextContent('Беларусь +375'))
		await expect(canvas.getByLabelText('Телефон')).toHaveValue('(91) 612-34-56')
		await userEvent.keyboard('{ArrowDown}')
		await waitFor(() => expect(page.getByRole('listbox', { name: 'Код страны' })).toBeVisible())
	},
}
