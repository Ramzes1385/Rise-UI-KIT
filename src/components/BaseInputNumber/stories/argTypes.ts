import type { Meta } from '@storybook/vue3-vite'
import type BaseInputNumber from '../ui/BaseInputNumber.vue'
import { INPUT_NUMBER_VARIANTS } from '../types/BaseInputNumber.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: INPUT_NUMBER_VARIANTS }),
	modelValue: { control: 'number', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	min: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	max: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	step: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	precision: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	hasControls: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseInputNumber>['argTypes']
