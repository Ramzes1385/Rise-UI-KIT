import type { Meta } from '@storybook/vue3-vite'
import type BaseHeatmap from '../ui/BaseHeatmap.vue'
import { HEATMAP_VARIANTS } from '../types/BaseHeatmap.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: HEATMAP_VARIANTS }),
	data: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	endDate: { control: 'date', table: propGroup(ARG_GROUP.content) },
	weeks: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	firstDayOfWeek: { control: { type: 'select' }, options: [undefined, 0, 1, 2, 3, 4, 5, 6], table: propGroup(ARG_GROUP.behavior) },
	markColor: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	formatValue: { control: false, table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseHeatmap>['argTypes']
