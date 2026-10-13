import type { Meta } from '@storybook/vue3-vite'
import type BaseDashboardGrid from '../ui/BaseDashboardGrid.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { DASHBOARD_COMPACT_TYPES, DASHBOARD_GRID_VARIANTS } from '../types/BaseDashboardGrid.types'

export const argTypes = {
	...baseArgTypes({ variants: DASHBOARD_GRID_VARIANTS }),
	layout: { control: 'object', table: propGroup(ARG_GROUP.content) },
	layouts: { control: 'object', table: propGroup(ARG_GROUP.content) },
	cols: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	rowHeight: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	gap: { control: 'number', table: propGroup(ARG_GROUP.appearance) },
	breakpoints: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	compactType: { control: 'inline-radio', options: DASHBOARD_COMPACT_TYPES, table: propGroup(ARG_GROUP.behavior) },
	isEditable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	item: { control: false },
	handle: { control: false },
	empty: { control: false },
} satisfies Meta<typeof BaseDashboardGrid>['argTypes']
