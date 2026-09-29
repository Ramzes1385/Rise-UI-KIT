import type { SearchArgs } from '../../shared'
import { waitFor, expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, resultTitles } from '../../shared'
import type { SearchResult } from '../../../types/BaseSearch.types'

const LONG_RESULTS: SearchResult[] = [
	{
		id: 1,
		title: 'Сериал «Северный ветер», сезон 2, серии 1–12 — финальный монтаж с русским дубляжом и субтитрами',
		description: 'Обновлено вчера · 48 файлов, 312 ГБ · ответственный — звукорежиссёр проекта',
		icon: 'folder',
		category: 'Папка',
	},
	{
		id: 2,
		title: 'Сериал «Северный ветер» — сводная таблица реплик и таймкодов для всех актёров озвучки',
		description: 'Таблица · 1 840 строк · последнее изменение 12 мая',
		icon: 'file',
		category: 'Документ',
	},
]

export const LongContent: StoryObj<SearchArgs> = {
	args: { modelValue: 'Северный ветер', results: LONG_RESULTS },
	parameters: {
		docs: {
			...docsFrame(240),
			description: { story: 'Длинные названия и описания обрезаются многоточием в одну строку и не растягивают панель.' },
		},
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		await waitFor(() => expect(resultTitles()).toHaveLength(2))
		const title = document.querySelector('.base-search__result-title') as HTMLElement
		await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth)
	},
}
