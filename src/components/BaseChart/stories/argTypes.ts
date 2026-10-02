import type BaseChart from '../ui/BaseChart.vue'
import type { Meta } from '@storybook/vue3-vite'
import { CHART_VARIANTS } from '../types/BaseChart.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CHART_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	series: { control: 'object', table: propGroup(ARG_GROUP.content) },
	labels: { control: 'object', table: propGroup(ARG_GROUP.content) },
	labelsTitle: { control: 'text', table: propGroup(ARG_GROUP.content) },
	hiddenSeries: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	isStacked: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasGrid: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasLegend: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	height: { control: { type: 'number', min: 80, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	yTickCount: { control: { type: 'number', min: 2, max: 12 }, table: propGroup(ARG_GROUP.appearance) },
	valueFormat: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	labelFormat: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	formatValue: { control: false, table: propGroup(ARG_GROUP.appearance) },
	formatLabel: { control: false, table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseChart>['argTypes']
