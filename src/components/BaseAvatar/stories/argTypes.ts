import type { Meta } from '@storybook/vue3-vite'
import type BaseAvatar from '../ui/BaseAvatar.vue'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { AVATAR_VARIANTS, AVATAR_SHAPES, AVATAR_RINGS, AVATAR_MASCOTS } from '../types/BaseAvatar.types'

export const argTypes = {
	...baseArgTypes({ variants: AVATAR_VARIANTS }),
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	name: { control: 'text', table: propGroup(ARG_GROUP.content) },
	src: { control: 'text', table: propGroup(ARG_GROUP.content) },
	alt: { control: 'text', table: propGroup(ARG_GROUP.content) },
	shape: { control: 'inline-radio', options: AVATAR_SHAPES, table: propGroup(ARG_GROUP.appearance) },
	ring: { control: 'inline-radio', options: AVATAR_RINGS, table: propGroup(ARG_GROUP.appearance) },
	mascot: { control: 'inline-radio', options: AVATAR_MASCOTS, table: propGroup(ARG_GROUP.content) },
	isOnline: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isEyesClosed: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	default: { control: false },
} satisfies Meta<typeof BaseAvatar>['argTypes']
