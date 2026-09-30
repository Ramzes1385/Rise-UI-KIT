import { activity } from './shared'
import { STORY_TODAY } from '@/stories/helpers'
import type { Meta } from '@storybook/vue3-vite'
import type BaseHeatmap from '../ui/BaseHeatmap.vue'

export const args = {
	data: activity(STORY_TODAY),
	label: 'Коммиты за год',
	endDate: STORY_TODAY,
	weeks: 53,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseHeatmap>['args']
