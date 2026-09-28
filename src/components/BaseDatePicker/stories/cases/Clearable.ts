import { storyDate } from '@/stories/helpers'
import type meta from '../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { fn, expect, waitFor } from 'storybook/test'

export const Clearable: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Кнопка очистки (`isClearable`) появляется, когда есть значение: сбрасывает его и отправляет событие `clear`.',
			},
		},
	},
	args: { modelValue: storyDate(0, 0, 0), isClearable: true, onClear: fn() },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Дата встречи')
		await expect(field).toHaveValue('15.05.2025')
		await userEvent.click(canvas.getByRole('button', { name: 'Очистить' }))
		await waitFor(() => expect(field).toHaveValue(''))
		await expect(canvas.queryByRole('button', { name: 'Очистить' })).not.toBeInTheDocument()
	},
}
