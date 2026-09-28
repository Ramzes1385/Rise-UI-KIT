import type { SearchArgs } from '../shared'
import { docsFrame, resultTitles } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'

export const ModalMode: StoryObj<SearchArgs> = {
	args: { mode: 'modal', modelValue: 'Лис' },
	parameters: {
		docs: {
			...docsFrame(420),
			description: {
				story: [
					'Режим `modal`: поле на странице открывает окно поиска по центру. Окно закрывают Escape, клик по подложке и кнопка',
					'«Закрыть»; запрос сохраняется до следующего открытия.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		const trigger = canvas.getByPlaceholderText('Поиск по проекту')
		await userEvent.click(trigger)
		const dialog = await screen.findByRole('dialog', { name: 'Поиск' })
		await waitFor(() => expect(dialog).toBeVisible())
		await expect(screen.getByRole('button', { name: 'Закрыть' })).toBeInTheDocument()

		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

		await userEvent.click(trigger)
		await waitFor(() => expect(resultTitles()).toEqual(['Сценарий «Лисья тропа»', 'Раскадровка «Лисья тропа»']))
	},
}
