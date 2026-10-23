import type { Meta } from '@storybook/vue3-vite'
import type BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { CHECKBOX_GROUP_VARIANTS } from '../types/BaseCheckboxGroup.types'

export const argTypes = {
	...baseArgTypes({ variants: CHECKBOX_GROUP_VARIANTS }),
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	options: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	selectAllLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isVertical: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasSelectAll: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseCheckboxGroup>['argTypes']
