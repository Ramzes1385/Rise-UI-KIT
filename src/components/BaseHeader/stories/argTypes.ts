import type { Meta } from '@storybook/vue3-vite'
import type BaseHeader from '../ui/BaseHeader.vue'
import { DRAWER_DIRECTIONS } from '@components/BaseDrawer'
import { CONTAINER_SIZES } from '@components/BaseContainer'
import { baseArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'
import { HEADER_NAV_ALIGNS, HEADER_VARIANTS } from '../types/BaseHeader.types'

export const argTypes = {
	...baseArgTypes({ variants: HEADER_VARIANTS }),
	title: { control: 'text', table: propGroup(ARG_GROUP.content) },
	href: { control: 'text', table: propGroup(ARG_GROUP.content) },
	containerSize: { control: 'inline-radio', options: CONTAINER_SIZES, table: propGroup(ARG_GROUP.appearance) },
	navAlign: { control: 'inline-radio', options: HEADER_NAV_ALIGNS, table: propGroup(ARG_GROUP.appearance) },
	isCompact: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isSticky: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	menuLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
	menuDirection: { control: 'inline-radio', options: DRAWER_DIRECTIONS, table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseHeader>['argTypes']
