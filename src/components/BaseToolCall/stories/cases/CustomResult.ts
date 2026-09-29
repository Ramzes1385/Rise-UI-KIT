import { TOOL_RESULT } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseToolCall.stories'
import BaseToolCall from '../../ui/BaseToolCall.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const CustomResult: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Слот `output` — своя разметка результата; слот `default` — действия, здесь для `pending`.' },
		},
		controls: { include: ['variant', 'sizeScale'] },
	},
	render: args => ({
		components: { BaseToolCall },
		setup: () => ({ props: useArgsWithoutSlots(args), pages: TOOL_RESULT }),
		template: `
			<div style="display: grid; gap: 12px; max-width: 560px">
				<BaseToolCall v-bind="props" is-open>
					<template #output>
						<ul style="margin: 0; padding-left: 20px">
							<li v-for="page in pages" :key="page.url"><a :href="page.url">{{ page.title }}</a></li>
						</ul>
					</template>
				</BaseToolCall>
				<BaseToolCall v-bind="props" name="send_email" title="Отправка письма" status="pending" :args="{ to: 'team@rise.dev' }" :result="undefined" is-open>
					<div style="display: flex; gap: 8px">
						<button type="button">Разрешить</button>
						<button type="button">Отклонить</button>
					</div>
				</BaseToolCall>
			</div>`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('link', { name: 'Темы и цвета' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Разрешить' })).toBeVisible()
	},
}
