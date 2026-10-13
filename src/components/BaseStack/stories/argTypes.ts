import type BaseStack from '../ui/BaseStack.vue'
import type { Meta } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, hiddenArgTypes, propGroup } from '@/stories/helpers'
import { STACK_ALIGNS, STACK_DIRECTIONS, STACK_GAPS, STACK_JUSTIFIES } from '../types/BaseStack.types'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant', 'color'),
	direction: { control: 'inline-radio', options: STACK_DIRECTIONS, table: propGroup(ARG_GROUP.appearance) },
	gap: { control: 'inline-radio', options: STACK_GAPS, table: propGroup(ARG_GROUP.appearance) },
	align: { control: 'inline-radio', options: STACK_ALIGNS, table: propGroup(ARG_GROUP.appearance) },
	justify: { control: 'inline-radio', options: STACK_JUSTIFIES, table: propGroup(ARG_GROUP.appearance) },
	isWrap: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isInline: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	tag: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ui: { control: false },
	default: { control: false },
} satisfies Meta<typeof BaseStack>['argTypes']
