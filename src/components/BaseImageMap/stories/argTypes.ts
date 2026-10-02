import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMap from '../ui/BaseImageMap.vue'
import { IMAGE_MAP_ACTIONS } from '../types/imageMapData.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { IMAGE_MAP_VARIANTS, IMAGE_MAP_WHEEL_MODES } from '../types/BaseImageMap.types'

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
} satisfies Meta<typeof BaseImageMap>['argTypes']
