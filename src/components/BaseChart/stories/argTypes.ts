import type BaseChart from '../ui/BaseChart.vue'
import type { Meta } from '@storybook/vue3-vite'
import { CHART_VARIANTS } from '../types/BaseChart.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CHART_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isStacked: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasGrid: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasLegend: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseChart>['argTypes']
