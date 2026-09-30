import type { Meta } from '@storybook/vue3-vite'
import type BaseAddressInput from '../ui/BaseAddressInput.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { ADDRESS_INPUT_VARIANTS } from '../types/BaseAddressInput.types'

export const argTypes = {
	...baseArgTypes({ variants: ADDRESS_INPUT_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	source: { control: false, table: propGroup(ARG_GROUP.behavior) },
	minChars: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	debounce: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseAddressInput>['argTypes']
