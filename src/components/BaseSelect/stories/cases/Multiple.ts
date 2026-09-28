import type meta from '../BaseSelect.stories'
import { GENRES, docsFrame } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { waitFor, expect, within, screen } from 'storybook/test'

export const Multiple: StoryObj<typeof meta> = {
	args: { label: 'Жанры', options: GENRES, isMultiple: true, modelValue: ['drama', 'comedy', 'fantasy'], placeholder: 'Выберите жанры' },
	parameters: {
		docs: {
			...docsFrame(360),
			description: {
				story: [
					'Мультивыбор: выбранные значения — бейджи в триггере, крестик убирает значение; список остаётся открытым,',
					'опции отмечаются чекбоксами.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Жанры' })
		await userEvent.click(canvas.getByRole('button', { name: 'Удалить Комедия' }))
		await waitFor(() => expect(within(trigger).queryByText('Комедия')).not.toBeInTheDocument())
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')

		await userEvent.click(trigger)
		const listbox = await screen.findByRole('listbox', { name: 'Жанры' })
		await expect(listbox).toHaveAttribute('aria-multiselectable', 'true')
		await userEvent.click(within(listbox).getByRole('option', { name: 'Детектив' }))
		await waitFor(() => expect(within(trigger).getByText('Детектив')).toBeInTheDocument())
		await expect(within(listbox).getByRole('option', { name: 'Детектив' })).toHaveAttribute('aria-selected', 'true')
		await expect(trigger).toHaveAttribute('aria-expanded', 'true')
	},
}
