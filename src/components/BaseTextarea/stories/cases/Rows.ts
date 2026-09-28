import { ref } from 'vue'
import { expect } from 'storybook/test'
import type meta from '../BaseTextarea.stories'
import BaseTextarea from '../../ui/BaseTextarea.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Rows: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Высота через `rows`: 1 строка — 32px, каждая следующая добавляет 20px. Пользователь может растянуть поле мышью.',
			},
			source: { code: [1, 3, 6].map(rows => `<BaseTextarea v-model="value" :rows="${rows}" label="rows: ${rows}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseTextarea },
		setup: () => ({
			props: useArgsWithoutSlots(args, ['default', 'modelValue', 'label', 'rows', 'onUpdate:modelValue']),
			rowsList: [1, 3, 6],
			values: ref<Record<number, string>>({ 1: '', 3: '', 6: '' }),
		}),
		template: `
			<div class="story-col story-narrow">
				<BaseTextarea
					v-for="rows in rowsList"
					:key="rows"
					v-bind="props"
					v-model="values[rows]"
					:rows="rows"
					:label="'rows: ' + rows" />
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const heights = ['rows: 1', 'rows: 3', 'rows: 6'].map(label => canvas.getByLabelText(label).getBoundingClientRect().height)
		await expect(heights.map(Math.round)).toEqual([32, 72, 132])
	},
}
