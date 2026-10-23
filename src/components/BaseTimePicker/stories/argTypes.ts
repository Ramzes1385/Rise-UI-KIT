import type { Meta } from '@storybook/vue3-vite'
import type BaseTimePicker from '../ui/BaseTimePicker.vue'
import { TIME_PICKER_VARIANTS } from '../types/BaseTimePicker.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TIME_PICKER_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	step: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	minTime: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	maxTime: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseTimePicker>['argTypes']
