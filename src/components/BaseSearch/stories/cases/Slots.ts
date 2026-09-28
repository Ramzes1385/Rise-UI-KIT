import { docsFrame } from '../shared'
import type { SearchArgs } from '../shared'
import BaseSearch from '../../ui/BaseSearch.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import { screen, waitFor, expect } from 'storybook/test'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

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
			source: {
				code: [
					'<BaseSearch v-model="query" :results="results">',
					'  <template #result-before>Файлы проекта</template>',
					'  <template #result-after="{ query }"><BaseButton variant="ghost">Все результаты по запросу «{{ query }}»</BaseButton></template>',
					'</BaseSearch>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseSearch, BaseButton },
			setup: () => ({ props: useArgsWithoutSlots(args, []), onUpdate }),
			template: `
				<div class="story-narrow">
					<BaseSearch v-bind="props" @update:model-value="onUpdate">
						<template #result-before>
							<div class="story-label" style="padding: 6px 8px 2px;">Файлы проекта</div>
						</template>
						<template #result-after="{ query }">
							<BaseButton variant="ghost" style="width: 100%;">Все результаты по запросу «{{ query }}»</BaseButton>
						</template>
					</BaseSearch>
				</div>
			`,
		}
	},
	play: async ({ canvas, userEvent }) => {
		await userEvent.click(canvas.getByPlaceholderText('Поиск по проекту'))
		const action = await screen.findByRole('button', { name: 'Все результаты по запросу «Лис»' })
		await waitFor(() => expect(action).toBeVisible())
		await expect(screen.getByText('Файлы проекта')).toBeVisible()
	},
}
