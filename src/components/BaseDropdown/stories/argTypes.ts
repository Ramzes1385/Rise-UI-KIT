import type { Meta } from '@storybook/vue3-vite'
import type BaseDropdown from '../ui/BaseDropdown.vue'
import { DROPDOWN_VARIANTS } from '../types/BaseDropdown.types'
import type { DropdownPosition } from '../types/BaseDropdown.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

const POSITIONS: DropdownPosition[] = [
	'bottom-start',
	'bottom',
	'bottom-end',
	'top-start',
	'top',
	'top-end',
	'left-start',
	'left',
	'left-end',
	'right-start',
	'right',
	'right-end',
]

export const argTypes = {
	...baseArgTypes({ variants: DROPDOWN_VARIANTS }),
	position: { control: 'select', options: POSITIONS, table: propGroup(ARG_GROUP.appearance) },
	gap: { control: { type: 'number', min: 0, max: 32 }, table: propGroup(ARG_GROUP.appearance) },
	maxHeight: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	matchWidth: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	padding: { control: 'object', table: propGroup(ARG_GROUP.appearance) },
	panelClass: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	isOpen: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	closeOnEscape: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	trapFocus: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	preventMousedown: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
	dropdown: { control: false },
} satisfies Meta<typeof BaseDropdown>['argTypes']
