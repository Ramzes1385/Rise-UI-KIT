import type BaseInput from '../ui/BaseInput.vue'
import type { Meta } from '@storybook/vue3-vite'
import { INPUT_VARIANTS } from '../types/BaseInput.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: INPUT_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	prefix: { control: 'text', table: propGroup(ARG_GROUP.content) },
	postfix: { control: 'text', table: propGroup(ARG_GROUP.content) },
	type: {
		control: 'inline-radio',
		options: ['text', 'email', 'tel', 'number', 'password', 'search', 'date'],
		table: propGroup(ARG_GROUP.behavior),
	},
	mask: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	allowedChars: { control: 'inline-radio', options: ['digits', 'letters', 'alphanumeric'], table: propGroup(ARG_GROUP.behavior) },
	passwordRules: { control: false, table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseInput>['argTypes']
