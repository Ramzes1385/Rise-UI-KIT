import type { Meta } from '@storybook/vue3-vite'
import type BaseRoadmap3D from '../ui/BaseRoadmap3D.vue'
import { SCENE_3D_CAMERA_PRESETS } from '@/scene3d/types/scene3d.types'
import { ARG_GROUP, hiddenArgTypes, propGroup } from '@/stories/helpers'
import { ROADMAP_3D_QUALITIES, ROADMAP_3D_VIEWS } from '../types/BaseRoadmap3D.types'

export const argTypes = {
	view: { control: 'inline-radio', options: ROADMAP_3D_VIEWS, table: propGroup(ARG_GROUP.appearance) },
	camera: { control: 'select', options: SCENE_3D_CAMERA_PRESETS, table: propGroup(ARG_GROUP.appearance) },
	quality: { control: 'inline-radio', options: ROADMAP_3D_QUALITIES, table: propGroup(ARG_GROUP.appearance) },
	focused: { control: 'text', table: propGroup(ARG_GROUP.behavior) },
	isTourPlaying: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	hasTour: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	has2dToggle: { control: 'boolean', table: propGroup(ARG_GROUP.behavior) },
	isLoading: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	isDisabled: { control: 'boolean', table: propGroup(ARG_GROUP.state) },
	...hiddenArgTypes('rendererFactory', 'configureLoader', 'models'),
} satisfies Meta<typeof BaseRoadmap3D>['argTypes']
