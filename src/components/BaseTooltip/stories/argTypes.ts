import type { Meta } from '@storybook/vue3-vite'
import type BaseTooltip from '../ui/BaseTooltip.vue'
import { TOOLTIP_VARIANTS } from '../types/BaseTooltip.types'
import { ENTER_ANIMATIONS } from '@composables/app/useMotion'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TOOLTIP_VARIANTS }),
	text: { control: 'text', table: propGroup(ARG_GROUP.content) },
	position: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'], table: propGroup(ARG_GROUP.appearance) },
	isAlwaysVisible: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isWrapperless: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	animation: { control: 'inline-radio', options: ENTER_ANIMATIONS, table: propGroup(ARG_GROUP.appearance) },
	ui: { control: false },
	default: { control: false },
} satisfies Meta<typeof BaseTooltip>['argTypes']
