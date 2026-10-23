import { ref } from 'vue'
import type { SearchArgs } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import BaseSearch from '../../../ui/BaseSearch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, resultTitles } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'
import type { SearchResult } from '../../../types/BaseSearch.types'

const CATALOG = ['Закат в горах', 'Каток', 'Карта', 'Касса']

const template = `
	<div class="story-narrow">
		<BaseSearch v-bind="args" v-model="query" :source="search" :debounce-ms="100" />
		<p>Ответов получено: {{ received }}</p>
	</div>
`

const script = `
const CATALOG = ['Закат в горах', 'Каток', 'Карта', 'Касса']
const query = ref('')
const received = ref(0)

function search(text: string): Promise<SearchResult[]> {
	const delay = 400 - text.length * 100
	return new Promise(resolve => {
		setTimeout(() => {
			received.value += 1
			const needle = text.toLowerCase()
			resolve(CATALOG.filter(title => title.toLowerCase().includes(needle)).map((title, index) => ({ id: index, title })))
		}, delay)
	})
}
`

export const AsyncSource: StoryObj<SearchArgs> = {
	args: { modelValue: '' },
	parameters: {
		docs: {
			...docsFrame(280),
			description: {
				story: [
					'Асинхронный источник (`source`): `(query, { signal }) => Promise<SearchResult[]>`. Новый запрос отменяет прежний (`signal`',
					'можно передать в `fetch`), а ответ на устаревший запрос не показывается, даже если пришёл позже. Здесь «сервер» отвечает на короткий запрос медленнее',
					'длинного (200 мс против 100 мс): ответ на «ка» приходит после ответа на «кар», но список остаётся ответом на «кар».',
					'Пока запрос идёт, поиск в состоянии загрузки.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseSearch', 'type SearchResult'],
				vue: ['ref'],
				script,
				omit: ['modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseSearch },
		setup: useStorySetup(args, {
			models: { query: 'modelValue' },
			setup: () => {
				const received = ref(0)
				const search = (text: string): Promise<SearchResult[]> => {
					const delay = 400 - text.length * 100
					return new Promise(resolve => {
						setTimeout(() => {
							received.value += 1
							const needle = text.toLowerCase()
							resolve(
								CATALOG.filter(title => title.toLowerCase().includes(needle)).map((title, index) => ({ id: index, title })),
							)
						}, delay)
					})
				}
				return { received, search }
			},
		}),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByPlaceholderText('Поиск по проекту')
		await userEvent.type(field, 'ка')
		await waitFor(() => expect(args.onSearch).toHaveBeenCalledWith('ка'))
		await userEvent.type(field, 'р')
		await waitFor(() => expect(canvas.getByText('Ответов получено: 2')).toBeVisible(), { timeout: 3000 })
		await expect(resultTitles()).toEqual(['Карта'])
	},
}
