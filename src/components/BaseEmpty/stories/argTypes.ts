import type BaseEmpty from '../ui/BaseEmpty.vue'
import type { Meta } from '@storybook/vue3-vite'
import { EMPTY_VARIANTS } from '../types/BaseEmpty.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: EMPTY_VARIANTS }),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isCompact: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	default: { control: false },
	actions: { control: false },
} satisfies Meta<typeof BaseEmpty>['argTypes']
