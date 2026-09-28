import type { Meta } from '@storybook/vue3-vite'
import type BaseSwitch from '../ui/BaseSwitch.vue'
import { SWITCH_VARIANTS } from '../types/BaseSwitch.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: SWITCH_VARIANTS }),
	modelValue: { control: 'boolean', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	reverse: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isRequired: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	default: { control: false },
} satisfies Meta<typeof BaseSwitch>['argTypes']
