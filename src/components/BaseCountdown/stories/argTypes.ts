import type { Meta } from '@storybook/vue3-vite'
import type BaseCountdown from '../ui/BaseCountdown.vue'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { COUNTDOWN_DIGIT_ANIMATIONS, COUNTDOWN_UNITS, COUNTDOWN_VARIANTS } from '../types/BaseCountdown.types'

export const argTypes = {
	...baseArgTypes({ variants: COUNTDOWN_VARIANTS }),
	to: { control: false, table: propGroup(ARG_GROUP.content) },
	format: { control: 'check', options: COUNTDOWN_UNITS, table: propGroup(ARG_GROUP.content) },
	layout: { control: 'inline-radio', options: ['blocks', 'inline'], table: propGroup(ARG_GROUP.appearance) },
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	digitAnimation: { control: 'inline-radio', options: COUNTDOWN_DIGIT_ANIMATIONS, table: propGroup(ARG_GROUP.appearance) },
	isLive: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseCountdown>['argTypes']
