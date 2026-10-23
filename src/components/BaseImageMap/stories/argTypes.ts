import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMap from '../ui/BaseImageMap.vue'
import { IMAGE_MAP_ACTIONS } from '../types/imageMapData.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import {
	IMAGE_MAP_DIRECTORY_GROUPINGS,
	IMAGE_MAP_DIRECTORY_POSITIONS,
	IMAGE_MAP_DIRECTORY_SCOPES,
	IMAGE_MAP_DIRECTORY_VIEWS,
	IMAGE_MAP_VARIANTS,
	IMAGE_MAP_WHEEL_MODES,
} from '../types/BaseImageMap.types'

const behavior = propGroup(ARG_GROUP.behavior)

export const argTypes = {
	...baseArgTypes({ variants: IMAGE_MAP_VARIANTS }),
	data: { control: 'object', table: propGroup(ARG_GROUP.content) },
	active: { control: 'text', table: propGroup(ARG_GROUP.state) },
	layer: { control: 'text', table: propGroup(ARG_GROUP.state) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	defaultAction: { control: 'select', options: IMAGE_MAP_ACTIONS, table: behavior },
	wheelZoom: { control: 'inline-radio', options: IMAGE_MAP_WHEEL_MODES, table: behavior },
	maxZoom: { control: { type: 'number', min: 1, max: 10, step: 0.5 }, table: behavior },
	initArea: { control: 'object', table: behavior },
	hasZoomControls: { control: 'boolean', table: behavior },
	hasFullscreen: { control: 'boolean', table: behavior },
	hasTooltip: { control: 'boolean', table: behavior },
	hasZoomToActive: { control: 'boolean', table: behavior },
	isPulsing: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	sheetBreakpoint: { control: { type: 'number', min: 0, step: 40 }, table: behavior },
	hasDirectory: { control: 'boolean', table: behavior },
	directoryPosition: { control: 'inline-radio', options: IMAGE_MAP_DIRECTORY_POSITIONS, table: behavior },
	directoryView: { control: 'inline-radio', options: IMAGE_MAP_DIRECTORY_VIEWS, table: behavior },
	directoryGroupBy: { control: 'inline-radio', options: IMAGE_MAP_DIRECTORY_GROUPINGS, table: behavior },
	directoryScope: { control: 'inline-radio', options: IMAGE_MAP_DIRECTORY_SCOPES, table: behavior },
	hasSearch: { control: 'boolean', table: behavior },
	hasFilters: { control: 'boolean', table: behavior },
	hasLegend: { control: 'boolean', table: propGroup(ARG_GROUP.appearance) },
	search: { control: 'text', table: propGroup(ARG_GROUP.state) },
	filters: { control: 'object', table: propGroup(ARG_GROUP.state) },
	hasDeepLinking: { control: 'boolean', table: behavior },
	deepLinkParam: { control: 'text', table: behavior },
} satisfies Meta<typeof BaseImageMap>['argTypes']
