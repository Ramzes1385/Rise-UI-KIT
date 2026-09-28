import type { Meta } from '@storybook/vue3-vite'
import type BaseNotification from '../ui/BaseNotification.vue'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { NOTIFICATION_VARIANTS, NOTIFICATION_TYPES, NOTIFICATION_POSITIONS } from '../types/BaseNotification.types'

export const argTypes = {
	...baseArgTypes({ variants: NOTIFICATION_VARIANTS }),
	...hiddenArgTypes('notificationKey', 'default', 'items'),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	actions: { control: 'object', table: propGroup(ARG_GROUP.content) },
	type: { control: 'inline-radio', options: NOTIFICATION_TYPES, table: propGroup(ARG_GROUP.appearance) },
	position: { control: 'select', options: NOTIFICATION_POSITIONS, table: propGroup(ARG_GROUP.appearance) },
	duration: { control: { type: 'number', min: 0, step: 1000 }, table: propGroup(ARG_GROUP.behavior) },
	isPersistent: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseNotification>['argTypes']
