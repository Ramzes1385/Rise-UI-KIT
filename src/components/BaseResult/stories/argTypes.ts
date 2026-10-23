import type { Meta } from '@storybook/vue3-vite'
import type BaseResult from '../ui/BaseResult.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { RESULT_STATUSES, RESULT_TITLE_TAGS, RESULT_VARIANTS } from '../types/BaseResult.types'

export const argTypes = {
	...baseArgTypes({ variants: RESULT_VARIANTS }),
	status: { control: 'select', options: RESULT_STATUSES, table: propGroup(ARG_GROUP.appearance) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	titleTag: { control: 'select', options: RESULT_TITLE_TAGS, table: propGroup(ARG_GROUP.content) },
	isLive: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
	extra: { control: false },
} satisfies Meta<typeof BaseResult>['argTypes']
