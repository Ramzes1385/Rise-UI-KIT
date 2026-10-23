import type { Meta } from '@storybook/vue3-vite'
import type BaseSplitButton from '../ui/BaseSplitButton.vue'
import { SPLIT_BUTTON_VARIANTS } from '../types/BaseSplitButton.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: SPLIT_BUTTON_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	menuLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseSplitButton>['argTypes']
