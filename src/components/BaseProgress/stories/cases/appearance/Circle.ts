import { expect } from 'storybook/test'
import type meta from '../../BaseProgress.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseProgress from '../../../ui/BaseProgress.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-row" style="gap: 24px;">
		<BaseProgress v-bind="args" :value="25" aria-label="Заполнение профиля" />
		<BaseProgress v-bind="args" :value="100" aria-label="Проверка документов" />
		<BaseProgress v-bind="args" :value="3" :max="5" aria-label="Шаги онбординга">
			<template #default="{ value }">{{ value }}/5</template>
		</BaseProgress>
	</div>
`

export const Circle: StoryObj<typeof meta> = {
	args: { shape: 'circle', hasLabel: true },
	parameters: {
		controls: { include: ['sizeScale', 'hasLabel', 'animation', 'color'] },
		docs: {
			description: { story: 'Кольцо (`shape="circle"`) — для компактных карточек и дашбордов. Подпись в центре меняется слотом.' },
			source: storySource({ template, imports: ['BaseProgress'], omit: ['default', 'value', 'max'] }),
		},
	},
	render: args => ({
		components: { BaseProgress },
		setup: useStorySetup(args, { slots: ['default', 'value', 'max'] }),
		template,
	}),
	play: async ({ canvas }) => {
		const steps = canvas.getByRole('progressbar', { name: 'Шаги онбординга' })
		await expect(steps).toHaveAttribute('aria-valuenow', '60')
		await expect(steps).toHaveTextContent('3/5')
	},
}
