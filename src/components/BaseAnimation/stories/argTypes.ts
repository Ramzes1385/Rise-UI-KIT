import type { Meta } from '@storybook/vue3-vite'
import type BaseAnimation from '../ui/BaseAnimation.vue'
import { propGroup, ARG_GROUP } from '@/stories/helpers'
import { ANIMATION_NAMES, ANIMATION_MODES } from '../types/BaseAnimation.types'

export const argTypes = {
	show: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	name: { control: 'select', options: ANIMATION_NAMES, table: propGroup(ARG_GROUP.appearance) },
	mode: { control: 'inline-radio', options: ANIMATION_MODES, table: propGroup(ARG_GROUP.behavior) },
	isGroup: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	tag: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	customClass: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	default: { control: false },
} satisfies Meta<typeof BaseAnimation>['argTypes']
