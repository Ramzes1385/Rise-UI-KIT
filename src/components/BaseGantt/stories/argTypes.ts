import type BaseGantt from '../ui/BaseGantt.vue'
import type { Meta } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { GANTT_SCALES, GANTT_VARIANTS } from '../types/BaseGantt.types'

export const argTypes = {
	...baseArgTypes({ variants: GANTT_VARIANTS }),
	tasks: { control: 'object', table: propGroup(ARG_GROUP.content) },
	today: { control: 'text', table: propGroup(ARG_GROUP.content) },
	scale: { control: 'inline-radio', options: GANTT_SCALES, table: propGroup(ARG_GROUP.appearance) },
	columnWidth: { control: { type: 'number', min: 8, max: 300, step: 2 }, table: propGroup(ARG_GROUP.appearance) },
	rowHeight: { control: { type: 'range', min: 24, max: 64, step: 4 }, table: propGroup(ARG_GROUP.appearance) },
	listWidth: { control: { type: 'range', min: 160, max: 480, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	height: { control: { type: 'range', min: 160, max: 720, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	dateFormat: { control: 'object', table: propGroup(ARG_GROUP.content) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	isTodayVisible: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isEditable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	collapsedIds: { control: 'object', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseGantt>['argTypes']
