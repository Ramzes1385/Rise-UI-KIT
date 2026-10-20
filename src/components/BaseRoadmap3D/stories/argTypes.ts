import type { Meta } from '@storybook/vue3-vite'
import type BaseRoadmap3D from '../ui/BaseRoadmap3D.vue'
import { ARG_GROUP, propGroup } from '@/stories/helpers'
import { ROADMAP_3D_QUALITIES, ROADMAP_3D_VIEWS } from '../types/BaseRoadmap3D.types'

export const argTypes = {
	view: { control: 'inline-radio', options: ROADMAP_3D_VIEWS, table: propGroup(ARG_GROUP.appearance) },
	quality: { control: 'inline-radio', options: ROADMAP_3D_QUALITIES, table: propGroup(ARG_GROUP.appearance) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
} satisfies Meta<typeof BaseRoadmap3D>['argTypes']
