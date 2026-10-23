import type BaseMap from '../ui/BaseMap.vue'
import type { Meta } from '@storybook/vue3-vite'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { MAP_LAYERS, MAP_PROVIDERS, MAP_SCHEMES, MAP_VARIANTS } from '../types/BaseMap.types'

export const argTypes = {
	...baseArgTypes({ variants: MAP_VARIANTS }),
	provider: { control: 'select', options: MAP_PROVIDERS, table: propGroup(ARG_GROUP.behavior) },
	apiKey: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	center: { control: 'object', table: propGroup(ARG_GROUP.content) },
	zoom: { control: { type: 'number', min: 0, max: 21 }, table: propGroup(ARG_GROUP.content) },
	markers: { control: 'object', table: propGroup(ARG_GROUP.content) },
	polylines: { control: 'object', table: propGroup(ARG_GROUP.content) },
	polygons: { control: 'object', table: propGroup(ARG_GROUP.content) },
	selected: { control: false, table: propGroup(ARG_GROUP.state) },
	staticPreview: { control: 'text', table: propGroup(ARG_GROUP.content) },
	scheme: { control: 'select', options: MAP_SCHEMES, table: propGroup(ARG_GROUP.appearance) },
	layer: { control: 'select', options: MAP_LAYERS, table: propGroup(ARG_GROUP.appearance) },
	hasControls: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	fitMarkers: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	boundsPadding: { control: { type: 'number', min: 0, max: 200 }, table: propGroup(ARG_GROUP.behavior) },
	isClustered: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isDraggable: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isScrollZoom: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	language: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	mapId: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.content) },
} satisfies Meta<typeof BaseMap>['argTypes']
