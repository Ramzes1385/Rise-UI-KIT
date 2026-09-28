import { LOADER_VARIANTS } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import type BaseLoader from '../ui/BaseLoader.vue'
import { baseArgTypes, propGroup, ARG_GROUP, hiddenArgTypes } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: LOADER_VARIANTS }),
	label: { control: 'text', table: propGroup(ARG_GROUP.content) },
	hasLabel: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	isOverlay: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	...hiddenArgTypes('default'),
} satisfies Meta<typeof BaseLoader>['argTypes']
