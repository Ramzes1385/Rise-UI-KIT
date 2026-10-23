import { STORY_TODAY } from '@/stories/helpers'
import type { Meta } from '@storybook/vue3-vite'
import type BaseCommentThread from '../ui/BaseCommentThread.vue'
import { CURRENT_USER, SAMPLE_COMMENTS } from './sampleComments'

export const args = {
	comments: SAMPLE_COMMENTS,
	currentUser: CURRENT_USER,
	now: STORY_TODAY,
	maxDepth: 3,
	isReadonly: false,
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseCommentThread>['args']
