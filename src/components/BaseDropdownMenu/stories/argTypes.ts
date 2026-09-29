import type { Meta } from '@storybook/vue3-vite'
import type BaseDropdownMenu from '../ui/BaseDropdownMenu.vue'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { DROPDOWN_MENU_VARIANTS } from '../types/BaseDropdownMenu.types'

export const argTypes = {
	...baseArgTypes({ variants: DROPDOWN_MENU_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	position: {
		control: 'select',
		options: ['bottom-start', 'bottom', 'bottom-end', 'top-start', 'top', 'top-end', 'right-start', 'left-start'],
		table: propGroup(ARG_GROUP.appearance),
	},
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	closeOnCheck: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
} satisfies Meta<typeof BaseDropdownMenu>['argTypes']
