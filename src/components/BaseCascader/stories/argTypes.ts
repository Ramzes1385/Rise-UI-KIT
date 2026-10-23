import type { Meta } from '@storybook/vue3-vite'
import type BaseCascader from '../ui/BaseCascader.vue'
import { CASCADER_VARIANTS } from '../types/BaseCascader.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CASCADER_VARIANTS }),
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	separator: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	load: { control: false, table: propGroup(ARG_GROUP.behavior) },
	isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isSearchable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isAnyLevel: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	triggerAttrs: { control: false, table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseCascader>['argTypes']
