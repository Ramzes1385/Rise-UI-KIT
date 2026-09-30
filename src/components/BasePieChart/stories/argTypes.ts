import type { Meta } from '@storybook/vue3-vite'
import type BasePieChart from '../ui/BasePieChart.vue'
import { PIE_CHART_VARIANTS } from '../types/BasePieChart.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: PIE_CHART_VARIANTS }),
	segments: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	maxSegments: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	size: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	formatValue: { control: false, table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BasePieChart>['argTypes']
