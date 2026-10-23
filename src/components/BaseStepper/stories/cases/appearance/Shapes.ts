import type meta from '../../BaseStepper.stories'
import { MODEL_KEYS, SLOT_KEYS } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseStepper from '../../../ui/BaseStepper.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { STEPPER_SHAPES } from '../../../types/BaseStepper.types'

const state = { steps: Object.fromEntries(STEPPER_SHAPES.map(shape => [shape, 3])) }

const hidden = [...MODEL_KEYS, ...SLOT_KEYS, 'shape']

const template = `
	<div class="story-stack">
		<div v-for="shape in STEPPER_SHAPES" :key="shape" class="story-stack">
			<span class="story-label">{{ shape }}</span>
			<BaseStepper v-bind="args" v-model="steps[shape]" :shape="shape" />
		</div>
	</div>
`

export const Shapes: StoryObj<typeof meta> = {
	argTypes: { shape: { control: false } },
	parameters: {
		controls: { include: ['orientation', 'sizeScale', 'variant'] },
		docs: {
			description: {
				story: 'Формы индикатора: `circle` (по умолчанию), `square`, `diamond` и `empty` — без индикатора, только линия прогресса.',
			},
			source: storySource({
				template,
				imports: ['BaseStepper', 'STEPPER_SHAPES'],
				state,
				types: { steps: 'Record<string, number>' },
				omit: hidden,
			}),
		},
	},
	render: args => ({
		components: { BaseStepper },
		setup: useStorySetup(args, { state, data: { STEPPER_SHAPES }, slots: hidden }),
		template,
	}),
}
