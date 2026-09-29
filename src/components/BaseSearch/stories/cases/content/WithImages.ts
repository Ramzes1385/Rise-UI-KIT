import type { SearchArgs } from '../../shared'
import { placeholderImage } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, resultTitles } from '../../shared'
import { waitFor, expect, screen } from 'storybook/test'
import type { SearchResult } from '../../../types/BaseSearch.types'

const ARTWORKS: SearchResult[] = [
	{
		id: 1,
		title: 'Закат в горах',
		description: 'Масло, холст · 80×60 см',
		image: placeholderImage({ width: 80, height: 80, hue: 24 }),
		category: 'Пейзаж',
	},
	{
		id: 2,
		title: 'Горы в тумане',
		description: 'Масло, холст · 70×50 см',
		image: placeholderImage({ width: 80, height: 80, hue: 200 }),
		category: 'Пейзаж',
	},
	{
		id: 3,
		title: 'Зелёная долина',
		description: 'Акрил, холст · 100×80 см',
		image: placeholderImage({ width: 80, height: 80, hue: 150 }),
		category: 'Пейзаж',
	},
	{
		id: 4,
		title: 'Горы в сумерках',
		description: 'Масло, холст · 60×40 см',
		image: placeholderImage({ width: 80, height: 80, hue: 270 }),
		category: 'Пейзаж',
	},
]

export const WithImages: StoryObj<SearchArgs> = {
	args: { modelValue: 'холст', results: ARTWORKS, placeholder: 'Поиск картин' },
	parameters: {
		docs: { ...docsFrame(320), description: { story: 'Превью (`image`) вместо иконки; совпадения с запросом выделены и в описании.' } },
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск картин'))
		await waitFor(() => expect(resultTitles()).toHaveLength(4))
		const preview = screen.getByRole('img', { name: 'Закат в горах' })
		await waitFor(() => expect(preview).toBeVisible())
		const marks = Array.from(document.querySelectorAll('.base-search__result mark')).map(mark => mark.textContent)
		await expect(marks).toEqual(['холст', 'холст', 'холст', 'холст'])
	},
}
