import { expect } from 'storybook/test'
import type meta from '../../BaseDatePicker.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Empty: StoryObj<typeof meta> = {
	parameters: { docs: { description: { story: 'Пустое поле: виден плейсхолдер, значения нет.' } } },
	play: async ({ canvas }) => {
		const field = canvas.getByLabelText('Дата встречи')
		await expect(field).toHaveValue('')
		await expect(field).toHaveAttribute('placeholder', 'Выберите дату')
	},
}
