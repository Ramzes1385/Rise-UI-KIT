import type { Meta } from '@storybook/vue3-vite'
import BaseCascader from '../ui/BaseCascader.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { selected: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseCascader v-bind="args" v-model="selected" /></div>
`

export const source = storySource({ template, imports: ['BaseCascader'], models })

export const render = (args => ({
	components: { BaseCascader },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseCascader>['render']
