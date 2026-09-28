import type { Meta } from '@storybook/vue3-vite'
import type BaseContextMenu from '../ui/BaseContextMenu.vue'
import { CONTEXT_MENU_VARIANTS } from '../types/BaseContextMenu.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: CONTEXT_MENU_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	default: { control: false },
} satisfies Meta<typeof BaseContextMenu>['argTypes']
