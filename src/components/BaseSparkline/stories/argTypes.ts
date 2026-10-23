import type { Meta } from '@storybook/vue3-vite'
import type BaseSparkline from '../ui/BaseSparkline.vue'
import { SPARKLINE_VARIANTS } from '../types/BaseSparkline.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: SPARKLINE_VARIANTS }),
	values: { control: 'object', table: propGroup(ARG_GROUP.content) },
	labels: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	markColor: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	height: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	formatValue: { control: false, table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseSparkline>['argTypes']
