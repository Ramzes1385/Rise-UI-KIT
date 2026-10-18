import type { Meta } from '@storybook/vue3-vite'
import type BaseRoadmap from '../ui/BaseRoadmap.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { ROADMAP_FILTERS, ROADMAP_LAYOUTS, ROADMAP_VARIANTS } from '../types/BaseRoadmap.types'

export const argTypes = {
	...baseArgTypes({ variants: ROADMAP_VARIANTS }),
	data: { control: 'object', table: propGroup(ARG_GROUP.content) },
	progress: { control: 'object', table: propGroup(ARG_GROUP.content) },
	storage: { control: false, table: propGroup(ARG_GROUP.behavior) },
	expanded: { control: 'object', table: propGroup(ARG_GROUP.state) },
	selected: { control: 'text', table: propGroup(ARG_GROUP.state) },
	filter: { control: 'inline-radio', options: [...ROADMAP_FILTERS], table: propGroup(ARG_GROUP.state) },
	layout: { control: 'inline-radio', options: [...ROADMAP_LAYOUTS], table: propGroup(ARG_GROUP.appearance) },
	narrowLayout: { control: 'inline-radio', options: [null, ...ROADMAP_LAYOUTS], table: propGroup(ARG_GROUP.appearance) },
	narrowWidth: { control: { type: 'number', min: 240, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	detailsPosition: { control: 'inline-radio', options: ['auto', 'side', 'sheet'], table: propGroup(ARG_GROUP.appearance) },
	hasSummary: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasFilter: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasLayoutSwitch: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	beforeStatusChange: { control: false, table: propGroup(ARG_GROUP.behavior) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseRoadmap>['argTypes']
