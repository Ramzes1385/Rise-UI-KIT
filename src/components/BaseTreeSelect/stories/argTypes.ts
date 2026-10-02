import type { Meta } from '@storybook/vue3-vite'
import type BaseTreeSelect from '../ui/BaseTreeSelect.vue'
import { TREE_SELECT_VARIANTS } from '../types/BaseTreeSelect.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TREE_SELECT_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseTreeSelect>['argTypes']
