import type { Meta } from '@storybook/vue3-vite'
import type BaseReasoning from '../ui/BaseReasoning.vue'
import { REASONING_VARIANTS } from '../types/BaseReasoning.types'
import { ARG_GROUP, baseArgTypes, propGroup, slotArgType } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: REASONING_VARIANTS }),
	content: { control: 'text', table: propGroup(ARG_GROUP.content) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	duration: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.content) },
	isStreaming: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	hasAutoToggle: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: slotArgType('Содержимое вместо content'),
} satisfies Meta<typeof BaseReasoning>['argTypes']
