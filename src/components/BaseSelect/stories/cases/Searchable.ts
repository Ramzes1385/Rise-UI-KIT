import { docsFrame } from '../shared'
import type meta from '../BaseSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'
import type { BaseSelectOption } from '../../types/BaseSelect.types'

const ALL_CITIES: BaseSelectOption[] = [
	'Москва',
	'Санкт-Петербург',
	'Новосибирск',
	'Екатеринбург',
	'Казань',
	'Нижний Новгород',
	'Челябинск',
	'Самара',
	'Омск',
	'Ростов-на-Дону',
	'Уфа',
	'Красноярск',
].map(label => ({ value: label, label }))

export const Searchable: StoryObj<typeof meta> = {
	args: { label: 'Город', options: ALL_CITIES, isSearchable: true },
	parameters: {
		docs: {
			...docsFrame(360),
			description: {
				story: [
					'Поиск по опциям (`isSearchable`): при открытии фокус переходит в поле поиска, список фильтруется по названию',
					'и описанию, стрелки и Enter выбирают опцию прямо из поля.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByRole('combobox', { name: 'Город' })
		await userEvent.click(trigger)
		const search = await screen.findByRole('textbox', { name: 'Поиск' })
		await waitFor(() => expect(search).toHaveFocus())

		await userEvent.keyboard('Каз')
		await waitFor(() => expect(screen.getAllByRole('option')).toHaveLength(1))
		await expect(screen.getByRole('option')).toHaveTextContent('Казань')

		await userEvent.keyboard('{Enter}')
		await expect(trigger).toHaveTextContent('Казань')
		await expect(trigger).toHaveAttribute('aria-expanded', 'false')
		await expect(trigger).toHaveFocus()
	},
}
