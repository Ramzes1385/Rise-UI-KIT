import type { Meta } from '@storybook/vue3-vite'
import type BasePhoneInput from '../ui/BasePhoneInput.vue'
import { PHONE_INPUT_VARIANTS } from '../types/BasePhoneInput.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: PHONE_INPUT_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	country: { control: 'text', table: propGroup(ARG_GROUP.content) },
	countries: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BasePhoneInput>['argTypes']
