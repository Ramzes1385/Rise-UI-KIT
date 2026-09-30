import type { Meta } from '@storybook/vue3-vite'
import type BaseRating from '../ui/BaseRating.vue'
import { RATING_VARIANTS } from '../types/BaseRating.types'
import { baseArgTypes, propGroup, ARG_GROUP, hiddenArgTypes } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: RATING_VARIANTS }),
	modelValue: { control: { type: 'number', min: 0, step: 0.1 }, table: propGroup(ARG_GROUP.content) },
	max: { control: { type: 'number', min: 1, max: 10 }, table: propGroup(ARG_GROUP.content) },
	icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	iconFilled: { control: 'text', table: propGroup(ARG_GROUP.content) },
	step: { control: 'inline-radio', options: [1, 0.5, 0.25, 0.1], table: propGroup(ARG_GROUP.behavior) },
	isValueShown: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isHoverSmooth: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	...hiddenArgTypes('default'),
} satisfies Meta<typeof BaseRating>['argTypes']
