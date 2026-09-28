import type { Meta } from '@storybook/vue3-vite'
import type BaseDrawer from '../ui/BaseDrawer.vue'
import { DRAWER_DIRECTIONS } from '../types/BaseDrawer.types'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant'),
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	description: { control: 'text', table: propGroup(ARG_GROUP.content) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	direction: { control: 'inline-radio', options: DRAWER_DIRECTIONS, table: propGroup(ARG_GROUP.appearance) },
	hasHandle: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	hasOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isDraggable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	closeOnOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	closeOnEscape: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
	header: { control: false },
	footer: { control: false },
} satisfies Meta<typeof BaseDrawer>['argTypes']
