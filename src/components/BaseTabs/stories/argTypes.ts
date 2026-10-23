import type BaseTabs from '../ui/BaseTabs.vue'
import type { Meta } from '@storybook/vue3-vite'
import { TABS_VARIANTS } from '../types/BaseTabs.types'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: TABS_VARIANTS }),
	modelValue: { control: 'text', table: propGroup(ARG_GROUP.content) },
	items: { control: 'object', table: propGroup(ARG_GROUP.content) },
	isFullWidth: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isScrollable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	default: { control: false },
} satisfies Meta<typeof BaseTabs>['argTypes']
