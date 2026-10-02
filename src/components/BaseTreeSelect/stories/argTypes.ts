import type { Meta } from '@storybook/vue3-vite'
import type BaseTreeSelect from '../ui/BaseTreeSelect.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { TREE_SELECT_CHECKED_STRATEGIES, TREE_SELECT_VARIANTS } from '../types/BaseTreeSelect.types'

export const argTypes = {
	...baseArgTypes({ variants: TREE_SELECT_VARIANTS }),
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	checkedStrategy: { control: 'inline-radio', options: TREE_SELECT_CHECKED_STRATEGIES, table: propGroup(ARG_GROUP.behavior) },
	maxTagCount: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	isSearchable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDefaultExpandAll: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseTreeSelect>['argTypes']
