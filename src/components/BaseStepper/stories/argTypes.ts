import type { Meta } from '@storybook/vue3-vite'
import type BaseStepper from '../ui/BaseStepper.vue'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { STEPPER_VARIANTS, STEPPER_CLICKABLE, STEPPER_ORIENTATIONS, STEPPER_SHAPES, STEPPER_SUMMARIES } from '../types/BaseStepper.types'

export const argTypes = {
	...baseArgTypes({ variants: STEPPER_VARIANTS }),
	modelValue: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.content) },
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	orientation: { control: 'inline-radio', options: STEPPER_ORIENTATIONS, table: propGroup(ARG_GROUP.appearance) },
	shape: { control: 'inline-radio', options: STEPPER_SHAPES, table: propGroup(ARG_GROUP.appearance) },
	summary: { control: 'inline-radio', options: STEPPER_SUMMARIES, table: propGroup(ARG_GROUP.appearance) },
	isLinear: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	clickable: { control: 'inline-radio', options: STEPPER_CLICKABLE, table: propGroup(ARG_GROUP.behavior) },
	item: { control: false },
	header: { control: false },
	footer: { control: false },
} satisfies Meta<typeof BaseStepper>['argTypes']
