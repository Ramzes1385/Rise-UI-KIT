import type { Meta } from '@storybook/vue3-vite'
import type BaseCheckbox from '../ui/BaseCheckbox.vue'
import { CHECKBOX_VARIANTS } from '../types/BaseCheckbox.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CHECKBOX_VARIANTS }),
	modelValue: { control: 'boolean', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseCheckbox>['argTypes']
