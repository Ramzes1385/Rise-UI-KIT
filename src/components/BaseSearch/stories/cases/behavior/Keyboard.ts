import { resultTitles } from '../../shared'
import type { SearchArgs } from '../../shared'
import { waitFor, expect } from 'storybook/test'
import BaseSearch from '../../../ui/BaseSearch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const state = { query: '' }

const template = `
	<div class="story-narrow"><BaseSearch v-bind="args" v-model="query" /></div>
`

export const Keyboard: StoryObj<SearchArgs> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура: Tab ставит фокус в поле, ввод показывает подсказки, стрелки подсвечивают результат,',
					'Enter выбирает его — запрос заменяется названием результата.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSearch'], state, omit: ['modelValue'] }),
		},
	},
	tags: ['!autodocs'],
	render: args => ({
		components: { BaseSearch },
		setup: useStorySetup(args, { state, slots: ['modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		const field = canvas.getByPlaceholderText('Поиск по проекту')
		await tabTo(field, userEvent)
		await userEvent.keyboard('Лис')
		await waitFor(() => expect(resultTitles()).toHaveLength(2))

		await userEvent.keyboard('{ArrowDown}{ArrowDown}')
		await expect(document.querySelector('.base-search__result--highlighted')).toHaveTextContent('Раскадровка «Лисья тропа»')
		await userEvent.keyboard('{Enter}')
		await expect(args.onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 4 }))
		await expect(field).toHaveValue('Раскадровка «Лисья тропа»')
		await waitFor(() => expect(resultTitles()).toHaveLength(0))
	},
}
