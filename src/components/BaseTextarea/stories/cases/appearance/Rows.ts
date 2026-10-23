import { expect } from 'storybook/test'
import type meta from '../../BaseTextarea.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTextarea from '../../../ui/BaseTextarea.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const rowsList = [1, 3, 6]

const state = { values: { 1: '', 3: '', 6: '' } }

const template = `
	<div class="story-col story-narrow">
		<BaseTextarea
			v-for="rows in rowsList"
			:key="rows"
			v-bind="args"
			v-model="values[rows]"
			:rows="rows"
			:label="'rows: ' + rows" />
	</div>
`

export const Rows: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Высота через `rows`: 1 строка — 32px, каждая следующая добавляет 20px. Пользователь может растянуть поле мышью.',
			},
			source: storySource({
				template,
				imports: ['BaseTextarea'],
				script: `const rowsList = ${literal(rowsList)}`,
				state,
				types: { values: 'Record<number, string>' },
				omit: ['default', 'modelValue', 'label', 'rows', 'onUpdate:modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseTextarea },
		setup: useStorySetup(args, { state, data: { rowsList }, slots: ['default', 'modelValue', 'label', 'rows', 'onUpdate:modelValue'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const heights = ['rows: 1', 'rows: 3', 'rows: 6'].map(label => canvas.getByLabelText(label).getBoundingClientRect().height)
		if (!isStoryBranded()) await expect(heights.map(Math.round)).toEqual([36, 76, 136])
		await expect(heights[1]! > heights[0]! && heights[2]! > heights[1]!).toBe(true)
	},
}
