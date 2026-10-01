import type BaseTable from '../ui/BaseTable.vue'
import type { Meta } from '@storybook/vue3-vite'
import { TABLE_VARIANTS } from '../types/BaseTable.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TABLE_VARIANTS }),
	columns: { control: 'object', table: propGroup(ARG_GROUP.content) },
	rows: { control: 'object', table: propGroup(ARG_GROUP.content) },
	emptyText: { control: 'text', table: propGroup(ARG_GROUP.content) },
	nestedConfig: { control: 'object', table: propGroup(ARG_GROUP.content) },
	padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	isVirtual: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	rowHeight: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	features: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	behavior: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	pageSize: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.behavior) },
	pageSizeOptions: { control: 'object', table: propGroup(ARG_GROUP.behavior) },
	loadMode: { control: 'inline-radio', options: ['pagination', 'button', 'infinite'], table: propGroup(ARG_GROUP.behavior) },
	searchDebounce: { control: { type: 'number', min: 0 }, table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseTable>['argTypes']
