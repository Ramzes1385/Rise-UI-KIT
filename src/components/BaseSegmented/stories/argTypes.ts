import { PERIODS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseSegmented from '../ui/BaseSegmented.vue'
import { SEGMENTED_VARIANTS } from '../types/BaseSegmented.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: SEGMENTED_VARIANTS }),
	modelValue: { control: 'inline-radio', options: PERIODS.map(option => option.value), table: propGroup(ARG_GROUP.content) },
	options: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isBlock: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseSegmented>['argTypes']
