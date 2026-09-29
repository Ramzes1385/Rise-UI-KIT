import { waitFor, expect } from 'storybook/test'
import type meta from '../../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Autosize: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Autosize: высота растёт вместе с текстом и уменьшается, когда текст удаляют. Ручного изменения размера нет.',
			},
		},
	},
	args: { label: 'Отзыв о товаре', placeholder: 'Что понравилось, а что нет', rows: 1, isAutosize: true },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Отзыв о товаре')
		const initialHeight = field.getBoundingClientRect().height
		await userEvent.type(field, 'Удобная ручка{Enter}Лёгкая{Enter}Хорошо держит заточку')
		await waitFor(() => expect(field.getBoundingClientRect().height).toBeGreaterThan(initialHeight))
		await userEvent.clear(field)
		await waitFor(() => expect(field.getBoundingClientRect().height).toBe(initialHeight))
	},
}
