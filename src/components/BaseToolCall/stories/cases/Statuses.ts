import { expect } from 'storybook/test'
import type meta from '../BaseToolCall.stories'
import BaseToolCall from '../../ui/BaseToolCall.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import { TOOL_CALL_STATUSES } from '../../types/BaseToolCall.types'

const template = `
	<div style="display: grid; gap: 12px; max-width: 560px">
		<BaseToolCall v-for="status in TOOL_CALL_STATUSES" :key="status" v-bind="args" :status="status" />
	</div>
`

export const Statuses: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Все состояния: ожидает, выполняется, готово, ошибка.' },
			source: storySource({ template, imports: ['BaseToolCall', 'TOOL_CALL_STATUSES'] }),
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseToolCall },
		setup: useStorySetup(args, { data: { TOOL_CALL_STATUSES } }),
		template,
	}),
	play: async ({ canvas }) => {
		for (const state of ['Ожидает', 'Выполняется', 'Готово', 'Ошибка'])
			await expect(canvas.getByRole('button', { name: new RegExp(`${state}$`) })).toBeVisible()
	},
}
