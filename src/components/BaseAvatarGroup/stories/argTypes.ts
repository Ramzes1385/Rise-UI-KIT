import type { Meta } from '@storybook/vue3-vite'
import type BaseAvatarGroup from '../ui/BaseAvatarGroup.vue'
import { AVATAR_GROUP_VARIANTS } from '../types/BaseAvatarGroup.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: AVATAR_GROUP_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	max: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	shape: { control: 'inline-radio', options: ['circle', 'square'], table: propGroup(ARG_GROUP.appearance) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
} satisfies Meta<typeof BaseAvatarGroup>['argTypes']
