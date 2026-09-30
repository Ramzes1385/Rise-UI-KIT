import { expect } from 'storybook/test'
import type meta from '../BaseProgress.stories'
import BaseProgress from '../../ui/BaseProgress.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-stack">
		<BaseProgress v-bind="args" :value="5" aria-label="Загрузка отчёта" />
		<BaseProgress v-bind="args" :value="100" aria-label="Загрузка фото" />
		<BaseProgress v-bind="args" :value="3" :max="5" aria-label="Регистрация">
			<template #default="{ value }">Шаг {{ value }} из 5</template>
		</BaseProgress>
	</div>
`

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
			source: storySource({ template, imports: ['BaseProgress'], omit: ['default', 'value', 'max', 'shape'] }),
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { slots: ['default', 'value', 'max', 'shape'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('progressbar', { name: 'Загрузка отчёта' })).toHaveTextContent('5%')
		await expect(canvas.getByRole('progressbar', { name: 'Регистрация' })).toHaveTextContent('Шаг 3 из 5')
	},
}
