import { expect } from 'storybook/test'
import type meta from '../BaseToolCall.stories'
import BaseToolCall from '../../ui/BaseToolCall.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { TOOL_CALL_STATUSES } from '../../types/BaseToolCall.types'

export const Statuses: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Все состояния: ожидает, выполняется, готово, ошибка.' } },
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseToolCall },
		setup: () => ({ props: useArgsWithoutSlots(args), statuses: TOOL_CALL_STATUSES }),
		template:
			'<div style="display: grid; gap: 12px; max-width: 560px"><BaseToolCall v-for="status in statuses" :key="status" v-bind="props" :status="status" /></div>',
	}),
	play: async ({ canvas }) => {
		for (const state of ['Ожидает', 'Выполняется', 'Готово', 'Ошибка'])
			await expect(canvas.getByRole('button', { name: new RegExp(`${state}$`) })).toBeVisible()
	},
}
