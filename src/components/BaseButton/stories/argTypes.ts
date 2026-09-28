import type { Meta } from '@storybook/vue3-vite'
import type BaseButton from '../ui/BaseButton.vue'
import { BUTTON_VARIANTS, BUTTON_TYPES } from '../types/BaseButton.types'
import { baseArgTypes, propGroup, ARG_GROUP, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BUTTON_VARIANTS }),
	type: { control: 'inline-radio', options: BUTTON_TYPES, table: propGroup(ARG_GROUP.behavior) },
	padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	default: slotArgType('Текст кнопки'),
	left: { control: false },
	right: { control: false },
} satisfies Meta<typeof BaseButton>['argTypes']
