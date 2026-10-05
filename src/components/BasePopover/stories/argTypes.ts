import type { Meta } from '@storybook/vue3-vite'
import type BasePopover from '../ui/BasePopover.vue'
import { POPOVER_VARIANTS } from '../types/BasePopover.types'
import { ENTER_ANIMATIONS } from '@composables/app/useMotion'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: POPOVER_VARIANTS }),
	position: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'], table: propGroup(ARG_GROUP.appearance) },
	maxHeight: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	trigger: { control: false },
	animation: { control: 'inline-radio', options: ENTER_ANIMATIONS, table: propGroup(ARG_GROUP.appearance) },
	ui: { control: false },
	default: { control: false },
} satisfies Meta<typeof BasePopover>['argTypes']
