import { expect } from 'storybook/test'
import type meta from '../../BaseRange.stories'
import BaseRange from '../../../ui/BaseRange.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `
	<div class="story-narrow">
		<BaseRange v-bind="args" v-model="value">
			<template #thumb="{ value }">
				<span
					style="display: flex; align-items: center; justify-content: center; min-width: 32px; height: 20px; padding: 0 6px;
						border-radius: 9999px; background: var(--rise-primary); color: var(--rise-on-primary);
						font-size: 12px; line-height: 16px; font-weight: 500; box-shadow: var(--rise-shadow-sm);">
					{{ value }}
				</span>
			</template>
		</BaseRange>
	</div>
`

export const CustomThumb: StoryObj<typeof meta> = {
	args: { modelValue: 35, ariaLabel: 'Скорость воспроизведения' },
	parameters: {
		docs: {
			description: { story: 'Свой бегунок в слоте `thumb`: получает `value` и `index`; фокус с клавиатуры — то же кольцо.' },
			source: storySource({ template, imports: ['BaseRange'], models, omit: ['thumb'] }),
		},
	},
	render: args => ({
		components: { BaseRange },
		setup: useStorySetup(args, { models, slots: ['thumb'] }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('slider', { name: 'Скорость воспроизведения' })).toHaveTextContent('35')
	},
}
