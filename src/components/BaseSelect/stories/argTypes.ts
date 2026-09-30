import type { Meta } from '@storybook/vue3-vite'
import type BaseSelect from '../ui/BaseSelect.vue'
import { SELECT_VARIANTS } from '../types/BaseSelect.types'
import { baseArgTypes, propGroup, ARG_GROUP, hiddenArgTypes } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: SELECT_VARIANTS }),
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	options: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isSearchable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	...hiddenArgTypes('default'),
} satisfies Meta<typeof BaseSelect>['argTypes']
