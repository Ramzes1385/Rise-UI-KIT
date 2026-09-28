import type { SearchArgs } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, renderWithLocalQuery, resultTitles } from '../shared'

export const SearchOnEnter: StoryObj<SearchArgs> = {
	args: { isInstant: false },
	parameters: {
		docs: {
			...docsFrame(240),
			description: {
				story: 'Поиск по Enter (`isInstant: false`): подсказки и событие `search` появляются только после нажатия Enter.',
			},
		},
	},
	render: renderWithLocalQuery,
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.type(canvas.getByPlaceholderText('Поиск по проекту'), 'Лис')
		await expect(resultTitles()).toHaveLength(0)
		await expect(args.onSearch).not.toHaveBeenCalled()

		await userEvent.keyboard('{Enter}')
		await expect(args.onSearch).toHaveBeenCalledWith('Лис')
		await waitFor(() => expect(resultTitles()).toEqual(['Сценарий «Лисья тропа»', 'Раскадровка «Лисья тропа»']))
	},
}
