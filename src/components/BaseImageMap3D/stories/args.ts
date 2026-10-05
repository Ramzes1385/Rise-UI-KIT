import { fn } from 'storybook/test'
import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import { IMAGE_MAP_FLOORS } from '@components/BaseImageMap/stories/fixtures'

export const args = {
	data: IMAGE_MAP_FLOORS,
	view: '3d',
	active: null,
	height: '360px',
	camera: 'isometric',
	layerMode: 'stack',
	hasOrbit: true,
	has2dToggle: false,
	'onUpdate:route': fn(),
	onSelect: fn(),
	onHover: fn(),
	'onUpdate:view': fn(),
	'onUpdate:layer': fn(),
	'onUpdate:active': fn(),
	onFallback: fn(),
	variant: 'default',
	sizeScale: 100,
} satisfies Meta<typeof BaseImageMap3D>['args']
