import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMap3D from '../ui/BaseImageMap3D.vue'
import { IMAGE_MAP_3D_VIEWS } from '../types/BaseImageMap3D.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'
import { IMAGE_MAP_VARIANTS } from '@components/BaseImageMap/types/BaseImageMap.types'

export const argTypes = {
	...baseArgTypes({ variants: IMAGE_MAP_VARIANTS }),
	data: { control: 'object', table: propGroup(ARG_GROUP.content) },
	view: { control: 'inline-radio', options: IMAGE_MAP_3D_VIEWS, table: propGroup(ARG_GROUP.state) },
	active: { control: 'text', table: propGroup(ARG_GROUP.state) },
	layer: { control: 'text', table: propGroup(ARG_GROUP.state) },
	height: { control: 'text', table: propGroup(ARG_GROUP.appearance) },
	ariaLabel: { control: 'text', table: propGroup(ARG_GROUP.a11y) },
	rendererFactory: { control: false, table: propGroup(ARG_GROUP.behavior) },
} satisfies Meta<typeof BaseImageMap3D>['argTypes']
