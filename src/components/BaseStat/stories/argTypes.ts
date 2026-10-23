import type BaseStat from '../ui/BaseStat.vue'
import type { Meta } from '@storybook/vue3-vite'
import { STAT_VARIANTS } from '../types/BaseStat.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: STAT_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	value: { control: 'number', table: propGroup(ARG_GROUP.content) },
	valueFormat: { control: 'object', table: propGroup(ARG_GROUP.content) },
	change: { control: { type: 'number', step: 0.01 }, table: propGroup(ARG_GROUP.content) },
	changeFormat: { control: 'object', table: propGroup(ARG_GROUP.content) },
	changeLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isInverse: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseStat>['argTypes']
