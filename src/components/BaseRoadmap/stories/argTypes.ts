import type { Meta } from '@storybook/vue3-vite'
import type BaseRoadmap from '../ui/BaseRoadmap.vue'
import { ROADMAP_VARIANTS } from '../types/BaseRoadmap.types'
import { ARG_GROUP, baseArgTypes, propGroup } from '@/stories/helpers'

export const argTypes = {
	...baseArgTypes({ variants: ROADMAP_VARIANTS }),
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseRoadmap>['argTypes']
