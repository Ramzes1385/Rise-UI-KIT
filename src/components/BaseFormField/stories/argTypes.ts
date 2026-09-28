import type { Meta } from '@storybook/vue3-vite'
import type BaseFormField from '../ui/BaseFormField.vue'
import { FORM_FIELD_VARIANTS } from '../types/BaseFormField.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: FORM_FIELD_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	for: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	default: { control: false },
} satisfies Meta<typeof BaseFormField>['argTypes']
