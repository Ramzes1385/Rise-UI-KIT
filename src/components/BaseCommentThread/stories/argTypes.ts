import type { Meta } from '@storybook/vue3-vite'
import type BaseCommentThread from '../ui/BaseCommentThread.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { COMMENT_THREAD_VARIANTS } from '../types/BaseCommentThread.types'

export const argTypes = {
	...baseArgTypes({ variants: COMMENT_THREAD_VARIANTS }),
	comments: { control: 'object', table: propGroup(ARG_GROUP.content) },
	currentUser: { control: 'object', table: propGroup(ARG_GROUP.content) },
	label: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	now: { control: 'date', table: propGroup(ARG_GROUP.behavior) },
	maxDepth: { control: { type: 'number', min: 1, max: 6 }, table: propGroup(ARG_GROUP.appearance) },
	isReadonly: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseCommentThread>['argTypes']
