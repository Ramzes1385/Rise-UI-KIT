import { expect } from 'storybook/test'
import type meta from '../BaseInputNumber.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const DecimalStep: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Дробный шаг и текст для скринридера: `step` 0,5, два знака после запятой (`precision`), `formatValueText` —',
					'«2,5 кг». Ввод «1.25» и «1,25» одинаковы; при выходе из поля число округляется до двух знаков и ограничивается.',
				].join('\n'),
			},
		},
	},
	args: {
		label: 'Вес посылки, кг',
		modelValue: 2.5,
		min: 0.5,
		max: 30,
		step: 0.5,
		precision: 2,
		formatValueText: (value: number) => `${String(value).replace('.', ',')} кг`,
	},
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('spinbutton', { name: 'Вес посылки, кг' })
		await expect(field).toHaveValue('2,50')
		await expect(field).toHaveAttribute('aria-valuetext', '2,5 кг')
		await userEvent.clear(field)
		await userEvent.type(field, '1.25')
		await userEvent.tab()
		await expect(args.onChange).toHaveBeenLastCalledWith(1.25)
		await expect(field).toHaveValue('1,25')
	},
}
