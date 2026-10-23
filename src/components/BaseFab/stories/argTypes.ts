import type BaseFab from '../ui/BaseFab.vue'
import type { Meta } from '@storybook/vue3-vite'
import { FAB_VARIANTS } from '../types/BaseFab.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: FAB_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	icon: { control: 'text', table: propGroup(ARG_GROUP.content) },
	isExtended: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	position: {
		control: 'select',
		options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'],
		table: propGroup(ARG_GROUP.appearance),
	},
	isContained: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseFab>['argTypes']
