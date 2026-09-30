import type { Meta } from '@storybook/vue3-vite'
import type BaseAccordion from '../ui/BaseAccordion.vue'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { ACCORDION_ARROW_POSITIONS, ACCORDION_DENSITIES, ACCORDION_DIVIDERS, ACCORDION_VARIANTS } from '../types/BaseAccordion.types'

export const argTypes = {
	...baseArgTypes({ variants: ACCORDION_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	arrowPosition: { control: 'inline-radio', options: ACCORDION_ARROW_POSITIONS, table: propGroup(ARG_GROUP.appearance) },
	showArrow: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	expandIcon: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	collapseIcon: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	divider: { control: 'inline-radio', options: ACCORDION_DIVIDERS, table: propGroup(ARG_GROUP.appearance) },
	density: { control: 'inline-radio', options: ACCORDION_DENSITIES, table: propGroup(ARG_GROUP.appearance) },
	isAccented: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isMultiple: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
} satisfies Meta<typeof BaseAccordion>['argTypes']
