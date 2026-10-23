import type { Meta } from '@storybook/vue3-vite'
import BaseImageMapEditor from '../ui/BaseImageMapEditor.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { map: 'modelValue' }

const template = `<BaseImageMapEditor v-bind="args" v-model="map" />`

export const source = storySource({
	template,
	imports: ['BaseImageMapEditor', 'type ImageMapData'],
	models,
	types: { map: 'ImageMapData' },
})

export const render = (args => ({
	components: { BaseImageMapEditor },
	setup: useStorySetup(args, { models }),
	template,
})) satisfies Meta<typeof BaseImageMapEditor>['render']
