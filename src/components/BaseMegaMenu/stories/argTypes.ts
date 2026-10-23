import type { Meta } from '@storybook/vue3-vite'
import type BaseMegaMenu from '../ui/BaseMegaMenu.vue'
import { BREAKPOINTS } from '@composables/app/useBreakpoint'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { MEGA_MENU_DRILLDOWNS, MEGA_MENU_VARIANTS } from '../types/BaseMegaMenu.types'

export const argTypes = {
	...baseArgTypes({ variants: MEGA_MENU_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	openKey: { control: 'select', options: [undefined, 'products', 'resources', 'company'], table: propGroup(ARG_GROUP.state) },
	trigger: { control: 'inline-radio', options: ['hover', 'click'], table: propGroup(ARG_GROUP.behavior) },
	openDelay: { control: { type: 'number', min: 0, step: 50 }, table: propGroup(ARG_GROUP.behavior) },
	closeDelay: { control: { type: 'number', min: 0, step: 50 }, table: propGroup(ARG_GROUP.behavior) },
	drilldown: { control: 'inline-radio', options: MEGA_MENU_DRILLDOWNS, table: propGroup(ARG_GROUP.behavior) },
	drilldownFrom: { control: { type: 'number', min: 2, max: 6 }, table: propGroup(ARG_GROUP.behavior) },
	mobileBreakpoint: { control: 'select', options: Object.keys(BREAKPOINTS), table: propGroup(ARG_GROUP.behavior) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	link: { control: false },
	promo: { control: false },
	end: { control: false },
} satisfies Meta<typeof BaseMegaMenu>['argTypes']
