import type { Meta } from '@storybook/vue3-vite'
import type BaseInputTags from '../ui/BaseInputTags.vue'
import { INPUT_TAGS_VARIANTS } from '../types/BaseInputTags.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: INPUT_TAGS_VARIANTS }),
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	maxTags: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	isUnique: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isAddOnBlur: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	separators: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseInputTags>['argTypes']
