import type { Meta } from '@storybook/vue3-vite'
import type BaseInplace from '../ui/BaseInplace.vue'
import { INPLACE_VARIANTS } from '../types/BaseInplace.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: INPLACE_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isSaveOnBlur: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseInplace>['argTypes']
