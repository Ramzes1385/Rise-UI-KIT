import type { Meta } from '@storybook/vue3-vite'
import BaseRoadmap3D from '../ui/BaseRoadmap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

export const models = {
	progress: 'progress',
	selected: 'selected',
	view: 'view',
	camera: 'camera',
	focused: 'focused',
	isTourPlaying: 'isTourPlaying',
}

export const types = {
	progress: 'RoadmapProgress',
	selected: 'string | null',
	view: 'Roadmap3DView',
	camera: "'iso' | 'iso-90' | 'iso-180' | 'iso-270' | 'top' | 'perspective'",
	focused: 'string | null',
	isTourPlaying: 'boolean',
}

export const imports = ['type RoadmapProgress']

export const importsFrom = { '@ramzes1385/rise-ui-kit/roadmap3d': ['BaseRoadmap3D', 'type Roadmap3DView'] }

const template = `
	<BaseRoadmap3D
		v-bind="args"
		v-model:progress="progress"
		v-model:selected="selected"
		v-model:view="view"
		v-model:camera="camera"
		v-model:focused="focused"
		v-model:is-tour-playing="isTourPlaying" />
`

export const source = storySource({ template, imports, importsFrom, models, types })

export const render = (args => ({
	components: { BaseRoadmap3D },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseRoadmap3D>['render']
