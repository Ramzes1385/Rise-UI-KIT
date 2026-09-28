import type { Meta } from '@storybook/vue3-vite'
import type BaseBackTop from '../ui/BaseBackTop.vue'
import { BACK_TOP_VARIANTS } from '../types/BaseBackTop.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: BACK_TOP_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	visibilityHeight: { control: 'number', table: propGroup(ARG_GROUP.behavior) },
	isExtended: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	position: {
		control: 'inline-radio',
		options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
		table: propGroup(ARG_GROUP.appearance),
	},
	isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	target: { control: false, table: propGroup(ARG_GROUP.behavior) },
	focusTarget: { control: false, table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseBackTop>['argTypes']
