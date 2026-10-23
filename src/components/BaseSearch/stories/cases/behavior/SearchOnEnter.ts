import type { SearchArgs } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import BaseSearch from '../../../ui/BaseSearch.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { docsFrame, resultTitles } from '../../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const state = { query: '' }

const template = `
	<div class="story-narrow"><BaseSearch v-bind="args" v-model="query" /></div>
`

export const SearchOnEnter: StoryObj<SearchArgs> = {
	args: { isInstant: false },
	parameters: {
		docs: {
			...docsFrame(240),
			description: {
				story: 'Поиск по Enter (`isInstant: false`): подсказки и событие `search` появляются только после нажатия Enter.',
			},
			source: storySource({ template, imports: ['BaseSearch'], state, omit: ['modelValue'] }),
		},
	},
	render: args => ({
		components: { BaseSearch },
		setup: useStorySetup(args, { state, slots: ['modelValue'] }),
		template,
	}),
	play: async ({ canvas, userEvent, args }) => {
		await userEvent.type(canvas.getByPlaceholderText('Поиск по проекту'), 'Лис')
		await expect(resultTitles()).toHaveLength(0)
		await expect(args.onSearch).not.toHaveBeenCalled()

		await userEvent.keyboard('{Enter}')
		await expect(args.onSearch).toHaveBeenCalledWith('Лис')
		await waitFor(() => expect(resultTitles()).toEqual(['Сценарий «Лисья тропа»', 'Раскадровка «Лисья тропа»']))
	},
}
