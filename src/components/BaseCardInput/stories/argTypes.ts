import type { Meta } from '@storybook/vue3-vite'
import type BaseCardInput from '../ui/BaseCardInput.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { CARD_INPUT_LAYOUTS, CARD_INPUT_VARIANTS } from '../types/BaseCardInput.types'

export const argTypes = {
	...baseArgTypes({ variants: CARD_INPUT_VARIANTS }),
	modelValue: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	layout: { control: 'inline-radio', options: CARD_INPUT_LAYOUTS, table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseCardInput>['argTypes']
