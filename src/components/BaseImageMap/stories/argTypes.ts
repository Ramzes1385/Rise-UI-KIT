import type { Meta } from '@storybook/vue3-vite'
import type BaseImageMap from '../ui/BaseImageMap.vue'
import { IMAGE_MAP_VARIANTS } from '../types/BaseImageMap.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: IMAGE_MAP_VARIANTS }),
	data: { control: 'object', table: propGroup(ARG_GROUP.content) },
} satisfies Meta<typeof BaseImageMap>['argTypes']
