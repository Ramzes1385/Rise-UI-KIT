import type { Meta } from '@storybook/vue3-vite'
import type BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import { MEGA_MENU_VARIANTS } from '../types/BaseMegaMenu.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: MEGA_MENU_VARIANTS }),
	columns: { control: 'object', table: propGroup(ARG_GROUP.content) },
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	layout: { control: 'inline-radio', options: ['columns', 'dropdown'], table: propGroup(ARG_GROUP.appearance) },
	trigger: { control: 'inline-radio', options: ['click', 'hover'], table: propGroup(ARG_GROUP.behavior) },
	hoverDelay: { control: { type: 'number', min: 0, step: 50 }, table: propGroup(ARG_GROUP.behavior) },
	'column-title': { control: false },
	'nav-item': { control: false },
	item: { control: false },
} satisfies Meta<typeof BaseMegaMenu>['argTypes']
