import { ORDER } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseTimeline from '../ui/BaseTimeline.vue'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { TIMELINE_DATE_POSITIONS, TIMELINE_VARIANTS } from '../types/BaseTimeline.types'

export const argTypes = {
	...baseArgTypes({ variants: TIMELINE_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	currentId: { control: 'inline-radio', options: ORDER.map(item => item.id), table: propGroup(ARG_GROUP.state) },
	orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'], table: propGroup(ARG_GROUP.appearance) },
	datePosition: { control: 'inline-radio', options: TIMELINE_DATE_POSITIONS, table: propGroup(ARG_GROUP.appearance) },
	isGrouped: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
} satisfies Meta<typeof BaseTimeline>['argTypes']
