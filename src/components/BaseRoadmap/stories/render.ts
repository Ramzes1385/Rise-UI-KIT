import BaseRoadmap from '../ui/BaseRoadmap.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

export const models = { progress: 'progress', expanded: 'expanded', selected: 'selected', filter: 'filter' }

export const types = { progress: 'RoadmapProgress', expanded: 'string[]', selected: 'string | null', filter: 'RoadmapFilter' }

export const imports = ['BaseRoadmap', 'type RoadmapProgress', 'type RoadmapFilter']

const template = `
	<BaseRoadmap
		v-bind="args"
		v-model:progress="progress"
		v-model:expanded="expanded"
		v-model:selected="selected"
		v-model:filter="filter" />
`

export const source = storySource({ template, imports, models, types })

export const render = (args => ({
	components: { BaseRoadmap },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseRoadmap>['render']
