import { SLOT_KEYS } from '../shared'
import { expect } from 'storybook/test'
import type meta from '../BaseStepper.stories'
import BaseStepper from '../../ui/BaseStepper.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useModelArg, useArgsWithoutSlots } from '@/stories/helpers'

export const CustomItem: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Слот `item` заменяет разметку шага целиком (параметры: `item`, `index`, `stepNumber`, `isActive`, `isCompleted`,',
					'`isDisabled`); клик по шагу по-прежнему переключает его.',
				].join('\n'),
			},
			source: {
				code: [
					'<BaseStepper v-model="step" :items="items">',
					'  <template #item="{ item, stepNumber, isActive }">',
					'    <span :class="{ active: isActive }">{{ stepNumber }}. {{ item.label }}</span>',
					'  </template>',
					'</BaseStepper>',
				].join('\n'),
			},
		},
	},
	render: args => {
		const onUpdate = useModelArg()
		return {
			components: { BaseStepper },
			setup: () => ({ props: useArgsWithoutSlots(args, SLOT_KEYS), onUpdate }),
			template: `
				<BaseStepper v-bind="props" @update:model-value="onUpdate">
					<template #item="{ item, stepNumber, isActive }">
						<span class="story-label" :style="{ color: isActive ? 'var(--rise-text-highlighted)' : undefined }">
							{{ stepNumber }}. {{ item.label }}
						</span>
					</template>
				</BaseStepper>
			`,
		}
	},
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('button', { name: '2. Доставка' })).toHaveAttribute('aria-current', 'step')
	},
}
