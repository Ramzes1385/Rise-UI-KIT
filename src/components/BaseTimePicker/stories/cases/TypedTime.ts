import { expect } from 'storybook/test'
import type meta from '../BaseTimePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const TypedTime: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ввод без двоеточия: «1415» при выходе из поля становится 14:15 — даже если такого времени нет в списке с шагом',
					'30 минут. Время вне рабочих часов («2130») не принимается: в поле возвращается прежнее значение.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByRole('combobox', { name: 'Время звонка' })
		await userEvent.type(field, '1415')
		await userEvent.tab()
		await expect(args.onChange).toHaveBeenLastCalledWith('14:15')
		await userEvent.clear(field)
		await userEvent.type(field, '2130')
		await userEvent.tab()
		await expect(field).toHaveValue('14:15')
	},
}
