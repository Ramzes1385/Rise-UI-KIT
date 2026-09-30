import { docsFrame } from '../../shared'
import type { SearchArgs } from '../../shared'
import BaseSearch from '../../../ui/BaseSearch.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { query: 'modelValue' }

const template = `
	<div class="story-narrow">
		<BaseSearch v-bind="args" v-model="query">
			<template #result-before>
				<div class="story-label" style="padding: 6px 8px 2px;">Файлы проекта</div>
			</template>
			<template #result-after="{ query }">
				<BaseButton variant="ghost" style="width: 100%;">Все результаты по запросу «{{ query }}»</BaseButton>
			</template>
		</BaseSearch>
	</div>
`

export const Slots: StoryObj<SearchArgs> = {
	args: { modelValue: 'Лис' },
	parameters: {
		docs: {
			description: {
				story: [
					'Слоты `result-before` и `result-after` — заголовок группы и действие под списком; `result` заменяет разметку',
					'одного результата, `results` — весь список, `empty` и `loading` — состояния.',
				].join('\n'),
			},
			...docsFrame(280),
			source: storySource({ template, imports: ['BaseSearch', 'BaseButton'], models, omit: [] }),
		},
	},
	render: args => ({
		components: { BaseSearch, BaseButton },
		setup: useStorySetup(args, { models, slots: [] }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		const action = await screen.findByRole('button', { name: 'Все результаты по запросу «Лис»' })
		await waitFor(() => expect(action).toBeVisible())
		await expect(screen.getByText('Файлы проекта')).toBeVisible()
	},
}
