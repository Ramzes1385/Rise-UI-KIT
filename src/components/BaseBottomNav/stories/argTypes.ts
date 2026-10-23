import type { Meta } from '@storybook/vue3-vite'
import type BaseBottomNav from '../ui/BaseBottomNav.vue'
import { BOTTOM_NAV_VARIANTS } from '../types/BaseBottomNav.types'
import { baseArgTypes, propGroup, ARG_GROUP, hiddenArgTypes } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BOTTOM_NAV_VARIANTS }),
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.state) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isFixed: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	hideOnScroll: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	maxBadge: { control: { type: 'number', min: 1, max: 999 }, table: propGroup(ARG_GROUP.appearance) },
	...hiddenArgTypes('linkComponent'),
	icon: { control: false },
	label: { control: false },
} satisfies Meta<typeof BaseBottomNav>['argTypes']
