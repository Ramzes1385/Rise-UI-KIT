import { PEOPLE } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseList.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Avatars: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Строки с аватаром (`avatar` — адрес картинки; без неё — инициалы из `title`), описанием и `meta` справа.',
					'Аватар декоративный (`alt=""`): имя уже есть в тексте строки.',
				].join('\n'),
			},
		},
	},
	args: { items: PEOPLE, selectionMode: 'none', label: 'Команда' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(canvas.getAllByRole('listitem')).toHaveLength(5)
		await expect(canvasElement.querySelectorAll('.base-list__prefix img[alt=""]')).toHaveLength(5)
		await userEvent.tab()
		await userEvent.keyboard('{ArrowDown}')
		await expect(canvas.getAllByRole('listitem')[1]).toHaveFocus()
	},
}
