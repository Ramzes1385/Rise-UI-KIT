import { expect } from 'storybook/test'
import type meta from '../../BaseText.stories'
import BaseText from '../../../ui/BaseText.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { TEXT_WEIGHT } from '../../../model/textWeight'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const weights = Object.entries(TEXT_WEIGHT)

const template = `
	<div class="story-col">
		<div v-for="[name, weight] in weights" :key="name" class="story-row">
			<span class="story-label">{{ weight }} · {{ name }}</span>
			<BaseText v-bind="args" :weight="weight">Отчёт за май готов</BaseText>
		</div>
	</div>
`

export const Weights: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			description: { story: 'Начертания из `TEXT_WEIGHT`: 400 — текст, 500 — подписи и кнопки, 600 — заголовки, 700 — акценты.' },
			source: storySource({ template, imports: ['BaseText'], script: `const weights = ${literal(weights)}` }),
		},
	},
	render: args => ({
		components: { BaseText },
		setup: useStorySetup(args, { data: { weights } }),
		template,
	}),
	play: async ({ canvas }) => {
		const [regular, , , bold] = canvas.getAllByText('Отчёт за май готов')
		await expect(getComputedStyle(regular).fontWeight).toBe('400')
		await expect(getComputedStyle(bold).fontWeight).toBe('700')
	},
}
