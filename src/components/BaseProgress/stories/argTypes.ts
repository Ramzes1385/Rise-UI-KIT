import type { Meta } from '@storybook/vue3-vite'
import type BaseProgress from '../ui/BaseProgress.vue'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { PROGRESS_SHAPES, PROGRESS_ANIMATIONS, PROGRESS_FILLS } from '../types/BaseProgress.types'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant'),
	value: { control: { type: 'range', min: 0, max: 100 }, table: propGroup(ARG_GROUP.content) },
	max: { control: 'number', table: propGroup(ARG_GROUP.content) },
	shape: { control: 'inline-radio', options: PROGRESS_SHAPES, table: propGroup(ARG_GROUP.appearance) },
	animation: { control: 'inline-radio', options: PROGRESS_ANIMATIONS, table: propGroup(ARG_GROUP.appearance) },
	fill: { control: 'inline-radio', options: PROGRESS_FILLS, table: propGroup(ARG_GROUP.appearance) },
	hasLabel: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isIndeterminate: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	default: { control: false },
} satisfies Meta<typeof BaseProgress>['argTypes']
