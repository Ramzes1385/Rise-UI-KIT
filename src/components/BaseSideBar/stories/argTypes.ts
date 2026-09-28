import type { Meta } from '@storybook/vue3-vite'
import type BaseSideBar from '../ui/BaseSideBar.vue'
import { SIDEBAR_VARIANTS } from '../types/BaseSideBar.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: SIDEBAR_VARIANTS }),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	width: { control: { type: 'range', min: 200, max: 400, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	collapsedWidth: { control: { type: 'range', min: 48, max: 96, step: 4 }, table: propGroup(ARG_GROUP.appearance) },
	padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	gap: { control: { type: 'range', min: 0, max: 12, step: 1 }, table: propGroup(ARG_GROUP.appearance) },
	isCollapsed: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isCollapsible: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	activePath: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	activeMatch: { control: 'inline-radio', options: ['exact', 'startsWith'], table: propGroup(ARG_GROUP.behavior) },
	activeKey: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	linkComponent: { control: false, table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
	header: { control: false },
	footer: { control: false },
	navigation: { control: false },
	collapsedContent: { control: false },
	item: { control: false },
	icon: { control: false },
	label: { control: false },
	badge: { control: false },
} satisfies Meta<typeof BaseSideBar>['argTypes']
