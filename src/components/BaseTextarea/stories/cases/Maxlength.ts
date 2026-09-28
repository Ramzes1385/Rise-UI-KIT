import type meta from '../BaseTextarea.stories'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'

export const Maxlength: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Ограничение длины `maxlength`: под полем справа — счётчик «введено/максимум», лишние символы не вводятся.',
					'Счётчик связан с полем через `aria-describedby`: скринридер называет лимит вместе с полем.',
				].join('\n'),
			},
		},
	},
	args: { label: 'Подпись к открытке', placeholder: 'До 40 символов', rows: 2, maxlength: 40 },
	play: async ({ canvas, userEvent }) => {
		const field = canvas.getByLabelText('Подпись к открытке')
		await expect(field).toHaveAccessibleDescription('0/40')
		await userEvent.type(field, 'С днём рождения! Пусть сбываются все мечты и планы')
		await expect(field).toHaveValue('С днём рождения! Пусть сбываются все меч')
		await waitFor(() => expect(field).toHaveAccessibleDescription('40/40'))
	},
}
