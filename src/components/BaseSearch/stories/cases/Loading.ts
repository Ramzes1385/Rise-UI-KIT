import { docsFrame } from '../shared'
import type { SearchArgs } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'

export const Loading: StoryObj<SearchArgs> = {
	args: { modelValue: 'Лисья', results: [], isRemote: true, isLoading: true },
	parameters: {
		docs: {
			...docsFrame(200),
			description: {
				story: [
					'Загрузка (`isLoading`): спиннер в поле; пока ответа нет, в панели — строка «Загрузка...» (заменяется слотом `loading`).',
					'Здесь — серверный поиск, ответ ещё не пришёл.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		const status = await screen.findByText('Загрузка...')
		await waitFor(() => expect(status).toBeVisible())
		await expect(screen.getAllByRole('status').length).toBeGreaterThan(0)
	},
}
