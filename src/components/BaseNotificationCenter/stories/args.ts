import { STORY_TODAY } from '@/stories/helpers'
import type { Meta } from '@storybook/vue3-vite'
import { SAMPLE_NOTIFICATIONS } from './sampleNotifications'
import type BaseNotificationCenter from '../ui/BaseNotificationCenter.vue'

export const args = {
	items: SAMPLE_NOTIFICATIONS,
	filter: 'all',
	now: STORY_TODAY,
	maxHeight: 360,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseNotificationCenter>['args']
