import { AI_ANSWER } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseAiMessage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAiMessage from '../../ui/BaseAiMessage.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { BaseToolCall } from '@components/BaseToolCall'
import { BaseReasoning } from '@components/BaseReasoning'

export const Composition: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Ответ целиком: рассуждение (BaseReasoning) и вызов инструмента (BaseToolCall) в слоте `default`, свои действия — в слоте `actions`.',
			},
		},
	},
	render: args => ({
		components: { BaseAiMessage, BaseReasoning, BaseToolCall },
		setup: () => ({ props: useArgsWithoutSlots(args), answer: AI_ANSWER }),
		template: `
			<div style="max-width: 720px">
				<BaseAiMessage v-bind="props" :content="answer">
					<BaseReasoning :duration="8" content="Пользователь спрашивает про подключение. Найду раздел об установке и приведу пример." />
					<BaseToolCall name="search_docs" title="Поиск по документации" status="success" :args="{ query: 'установка плагина' }" :result="[{ title: 'Быстрый старт', url: '/docs/start' }]" />
					<template #actions>
						<button type="button" class="base-ai-message__action">Нравится</button>
						<button type="button" class="base-ai-message__action">Не нравится</button>
					</template>
				</BaseAiMessage>
			</div>`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: 'Думал 8 с' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: /Поиск по документации/ })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Нравится' })).toBeVisible()
	},
}
