import { ICON_NAMES } from './shared'
import type BaseIcon from '../ui/BaseIcon.vue'
import type { Meta } from '@storybook/vue3-vite'
import { baseArgTypes, hiddenArgTypes, propGroup, ARG_GROUP } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes(),
	...hiddenArgTypes('variant'),
	name: { control: 'select', options: ICON_NAMES, table: propGroup(ARG_GROUP.content) },
	color: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	rotate: { control: { type: 'range', min: 0, max: 360, step: 45 }, table: propGroup(ARG_GROUP.appearance) },
	isFlipX: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isFlipY: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
} satisfies Meta<typeof BaseIcon>['argTypes']
