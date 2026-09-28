import type BasePin from '../ui/BasePin.vue'
import type { Meta } from '@storybook/vue3-vite'
import { PIN_VARIANTS } from '../types/BasePin.types'
import { baseArgTypes, propGroup, ARG_GROUP, hiddenArgTypes } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: PIN_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	length: { control: { type: 'number', min: 1, max: 8 }, table: propGroup(ARG_GROUP.behavior) },
	type: { control: 'inline-radio', options: ['text', 'password', 'number'], table: propGroup(ARG_GROUP.behavior) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	...hiddenArgTypes('default'),
} satisfies Meta<typeof BasePin>['argTypes']
