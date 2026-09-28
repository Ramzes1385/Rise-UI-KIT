import { ref } from 'vue'
import type meta from '../BaseStepper.stories'
import { MODEL_KEYS, SLOT_KEYS } from '../shared'
import BaseStepper from '../../ui/BaseStepper.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { useArgsWithoutSlots } from '@/stories/helpers'
import { STEPPER_SHAPES } from '../../types/BaseStepper.types'

export const Shapes: StoryObj<typeof meta> = {
	argTypes: { shape: { control: false } },
	parameters: {
		controls: { include: ['orientation', 'sizeScale', 'variant'] },
		docs: {
			description: {
				story: 'Формы индикатора: `circle` (по умолчанию), `square`, `diamond` и `empty` — без индикатора, только линия прогресса.',
			},
			source: { code: STEPPER_SHAPES.map(shape => `<BaseStepper v-model="step" :items="items" shape="${shape}" />`).join('\n') },
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup: () => ({
			props: useArgsWithoutSlots(args, [...MODEL_KEYS, ...SLOT_KEYS, 'shape']),
			shapes: STEPPER_SHAPES,
			steps: ref<Record<string, number>>(Object.fromEntries(STEPPER_SHAPES.map(shape => [shape, 3]))),
		}),
		template: `
			<div class="story-stack">
				<div v-for="shape in shapes" :key="shape" class="story-stack">
					<span class="story-label">{{ shape }}</span>
					<BaseStepper v-bind="props" v-model="steps[shape]" :shape="shape" />
				</div>
			</div>
		`,
	}),
}
