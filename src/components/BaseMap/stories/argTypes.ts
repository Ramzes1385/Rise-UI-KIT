import type BaseMap from '../ui/BaseMap.vue'
import type { Meta } from '@storybook/vue3-vite'
import { MAP_PROVIDERS, MAP_VARIANTS } from '../types/BaseMap.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: MAP_VARIANTS }),
	provider: { control: 'select', options: MAP_PROVIDERS, table: propGroup(ARG_GROUP.behavior) },
	apiKey: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	center: { control: 'object', table: propGroup(ARG_GROUP.content) },
	zoom: { control: { type: 'number', min: 0, max: 21 }, table: propGroup(ARG_GROUP.content) },
	markers: { control: 'object', table: propGroup(ARG_GROUP.content) },
	language: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	mapId: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
} satisfies Meta<typeof BaseMap>['argTypes']
