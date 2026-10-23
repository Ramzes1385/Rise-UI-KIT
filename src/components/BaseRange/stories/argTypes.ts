import type BaseRange from '../ui/BaseRange.vue'
import type { Meta } from '@storybook/vue3-vite'
import { RANGE_VARIANTS } from '../types/BaseRange.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: RANGE_VARIANTS }),
	modelValue: { control: { type: 'number' }, table: propGroup(ARG_GROUP.content) },
	rangeValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	points: { control: 'object', table: propGroup(ARG_GROUP.content) },
	min: { control: 'number', table: propGroup(ARG_GROUP.content) },
	max: { control: 'number', table: propGroup(ARG_GROUP.content) },
	step: { control: 'number', table: propGroup(ARG_GROUP.content) },
	marks: { control: 'object', table: propGroup(ARG_GROUP.content) },
	hasLabel: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasTooltip: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isVertical: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	thumb: { control: false },
} satisfies Meta<typeof BaseRange>['argTypes']
