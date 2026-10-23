import type { SearchArgs } from '../../shared'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, resultTitles } from '../../shared'
import type { SearchResult } from '../../../types/BaseSearch.types'

const REMOTE_RESULTS: SearchResult[] = [
	{ id: 1, title: 'Закат в горах', description: 'Найдено по транслиту', icon: 'video' },
	{ id: 2, title: 'Вечер у моря', description: 'Совпадение по тегу «закаты»', icon: 'image', category: 'Закаты' },
]

export const RemoteResults: StoryObj<SearchArgs> = {
	args: { isRemote: true, modelValue: 'zakat', results: REMOTE_RESULTS },
	parameters: {
		docs: {
			...docsFrame(220),
			description: {
				story: [
					'Серверный поиск (`isRemote`): результаты показываются как есть, без фильтрации по подстроке.',
					'«Вечер у моря» не содержит «zakat» — без `isRemote` этот ответ сервера был бы скрыт.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		await waitFor(() => expect(resultTitles()).toEqual(['Закат в горах', 'Вечер у моря']))
	},
}
