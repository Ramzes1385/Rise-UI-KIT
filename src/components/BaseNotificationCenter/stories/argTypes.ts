import type { Meta } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import type BaseNotificationCenter from '../ui/BaseNotificationCenter.vue'
import { NOTIFICATION_CENTER_VARIANTS, NOTIFICATION_FILTERS } from '../types/BaseNotificationCenter.types'

export const argTypes = {
	...baseArgTypes({ variants: NOTIFICATION_CENTER_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	filter: { control: 'inline-radio', options: NOTIFICATION_FILTERS, table: propGroup(ARG_GROUP.state) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	now: { control: 'date', table: propGroup(ARG_GROUP.behavior) },
	maxHeight: { control: { type: 'number', min: 160, max: 800, step: 20 }, table: propGroup(ARG_GROUP.appearance) },
	ui: { control: false },
} satisfies Meta<typeof BaseNotificationCenter>['argTypes']
