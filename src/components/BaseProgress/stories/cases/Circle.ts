import { expect } from 'storybook/test'
import type meta from '../BaseProgress.stories'
import BaseProgress from '../../ui/BaseProgress.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const Circle: StoryObj<typeof meta> = {
	args: { shape: 'circle', hasLabel: true },
	parameters: {
		controls: { include: ['sizeScale', 'hasLabel', 'animation', 'color'] },
		docs: {
			description: { story: 'Кольцо (`shape="circle"`) — для компактных карточек и дашбордов. Подпись в центре меняется слотом.' },
			source: {
				code: [
					'<BaseProgress shape="circle" :value="25" has-label />',
					'<BaseProgress shape="circle" :value="100" has-label />',
					'<BaseProgress shape="circle" :value="3" :max="5" has-label>',
					'  <template #default="{ value }">{{ value }}/5</template>',
					'</BaseProgress>',
				].join('\n'),
			},
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: () => ({ props: useArgsWithoutSlots(args, ['default', 'value', 'max']) }),
		template: `
			<div class="story-row" style="gap: 24px;">
				<BaseProgress v-bind="props" :value="25" aria-label="Заполнение профиля" />
				<BaseProgress v-bind="props" :value="100" aria-label="Проверка документов" />
				<BaseProgress v-bind="props" :value="3" :max="5" aria-label="Шаги онбординга">
					<template #default="{ value }">{{ value }}/5</template>
				</BaseProgress>
			</div>
		`,
	}),
	play: async ({ canvas }) => {
		const steps = canvas.getByRole('progressbar', { name: 'Шаги онбординга' })
		await expect(steps).toHaveAttribute('aria-valuenow', '60')
		await expect(steps).toHaveTextContent('3/5')
	},
}
