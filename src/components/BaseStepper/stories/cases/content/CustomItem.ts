import { expect } from 'storybook/test'
import { SLOT_KEYS } from '../../shared'
import type meta from '../../BaseStepper.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { step: 'modelValue' }

const template = `
	<BaseStepper v-bind="args" v-model="step">
		<template #item="{ item, stepNumber, isActive }">
			<span class="story-label" :style="{ color: isActive ? 'var(--rise-text-highlighted)' : undefined }">
				{{ stepNumber }}. {{ item.label }}
			</span>
		</template>
	</BaseStepper>
`

export const CustomItem: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `item` заменяет разметку шага целиком (параметры: `item`, `index`, `stepNumber`, `isActive`, `isCompleted`,',
					'`isDisabled`); клик по шагу по-прежнему переключает его.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseStepper'], models, omit: SLOT_KEYS }),
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup: useStorySetup(args, { models, slots: SLOT_KEYS }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: '2. Доставка' })).toHaveAttribute('aria-current', 'step')
	},
}
