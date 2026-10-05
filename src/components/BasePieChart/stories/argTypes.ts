import type { Meta } from '@storybook/vue3-vite'
import type BasePieChart from '../ui/BasePieChart.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { PIE_CHART_ANIMATIONS, PIE_CHART_VARIANTS } from '../types/BasePieChart.types'

export const argTypes = {
	...baseArgTypes({ variants: PIE_CHART_VARIANTS }),
	segments: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	maxSegments: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	size: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	animation: { control: 'inline-radio', options: PIE_CHART_ANIMATIONS, table: propGroup(ARG_GROUP.behavior) },
	formatValue: { control: false, table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BasePieChart>['argTypes']
