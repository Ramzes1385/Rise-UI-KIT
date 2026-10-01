import type { Meta } from '@storybook/vue3-vite'
import type BaseTextarea from '../ui/BaseTextarea.vue'
import { TEXTAREA_VARIANTS } from '../types/BaseTextarea.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TEXTAREA_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	rows: { control: { type: 'number', min: 1, max: 12 }, table: propGroup(ARG_GROUP.appearance) },
	isAutosize: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	maxlength: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	name: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseTextarea>['argTypes']
