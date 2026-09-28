import { expect } from 'storybook/test'
import type meta from '../BaseProgress.stories'
import BaseProgress from '../../ui/BaseProgress.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const WithLabel: StoryObj<typeof meta> = {
	args: { hasLabel: true },
	parameters: {
		controls: { include: ['sizeScale', 'color'] },
		docs: {
			description: {
				story: [
					'Подпись `hasLabel` над полосой прижата к концу заливки; в начале шкалы не уходит за левый край.',
					'Слот меняет текст подписи — например, на «Шаг 3 из 5».',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseProgress :value="5" has-label />',
					'<BaseProgress :value="3" :max="5" has-label>',
					'  <template #default="{ value }">Шаг {{ value }} из 5</template>',
					'</BaseProgress>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'value', 'max', 'shape']) }),
		template: `
			<div class="story-stack">
				<BaseProgress v-bind="props" :value="5" aria-label="Загрузка отчёта" />
				<BaseProgress v-bind="props" :value="100" aria-label="Загрузка фото" />
				<BaseProgress v-bind="props" :value="3" :max="5" aria-label="Регистрация">
					<template #default="{ value }">Шаг {{ value }} из 5</template>
				</BaseProgress>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('progressbar', { name: 'Загрузка отчёта' })).toHaveTextContent('5%')
		await expect(canvas.getByRole('progressbar', { name: 'Регистрация' })).toHaveTextContent('Шаг 3 из 5')
	},
}
