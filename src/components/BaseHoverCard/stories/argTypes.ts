import type { Meta } from '@storybook/vue3-vite'
import type BaseHoverCard from '../ui/BaseHoverCard.vue'
import { ENTER_ANIMATIONS } from '@composables/app/useMotion'
import { HOVER_CARD_VARIANTS } from '../types/BaseHoverCard.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

const POSITIONS = [
	'bottom',
	'bottom-start',
	'bottom-end',
	'top',
	'top-start',
	'top-end',
	'left',
	'left-start',
	'left-end',
	'right',
	'right-start',
	'right-end',
]

export const argTypes = {
	...baseArgTypes({ variants: HOVER_CARD_VARIANTS }),
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	position: { control: 'select', options: POSITIONS, table: propGroup(ARG_GROUP.appearance) },
	maxHeight: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	animation: { control: 'inline-radio', options: ENTER_ANIMATIONS, table: propGroup(ARG_GROUP.appearance) },
	openDelay: { control: { type: 'number', min: 0, step: 50 }, table: propGroup(ARG_GROUP.behavior) },
	closeDelay: { control: { type: 'number', min: 0, step: 50 }, table: propGroup(ARG_GROUP.behavior) },
	trigger: { control: false },
	default: { control: false },
	ui: { control: false },
} satisfies Meta<typeof BaseHoverCard>['argTypes']
