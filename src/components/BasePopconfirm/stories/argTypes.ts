import type { Meta } from '@storybook/vue3-vite'
import type BasePopconfirm from '../ui/BasePopconfirm.vue'
import { ENTER_ANIMATIONS } from '@composables/app/useMotion'
import { POPCONFIRM_VARIANTS } from '../types/BasePopconfirm.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: POPCONFIRM_VARIANTS }),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	confirmLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	cancelLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	position: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'], table: propGroup(ARG_GROUP.appearance) },
	showArrow: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isDanger: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	animation: { control: 'inline-radio', options: ENTER_ANIMATIONS, table: propGroup(ARG_GROUP.appearance) },
	ui: { control: false },
	default: { control: false },
} satisfies Meta<typeof BasePopconfirm>['argTypes']
