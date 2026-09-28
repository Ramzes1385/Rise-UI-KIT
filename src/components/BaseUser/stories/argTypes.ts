import type BaseUser from '../ui/BaseUser.vue'
import type { Meta } from '@storybook/vue3-vite'
import { USER_VARIANTS } from '../types/BaseUser.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: USER_VARIANTS }),
	name: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	src: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isOnline: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'], table: propGroup(ARG_GROUP.appearance) },
	to: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseUser>['argTypes']
