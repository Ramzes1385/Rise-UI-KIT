import type { Meta } from '@storybook/vue3-vite'
import type BaseMention from '../ui/BaseMention.vue'
import { MENTION_VARIANTS } from '../types/BaseMention.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: MENTION_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	options: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	placeholder: { control: 'text', table: propGroup(ARG_GROUP.content) },
	trigger: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	maxSuggestions: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.behavior) },
	rows: { control: { type: 'number', min: 1 }, table: propGroup(ARG_GROUP.appearance) },
	error: { control: 'text', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseMention>['argTypes']
