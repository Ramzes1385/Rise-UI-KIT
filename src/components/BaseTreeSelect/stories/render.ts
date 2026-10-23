import type { Meta } from '@storybook/vue3-vite'
import BaseTreeSelect from '../ui/BaseTreeSelect.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { selected: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseTreeSelect v-bind="args" v-model="selected" /></div>
`

export const source = storySource({ template, imports: ['BaseTreeSelect'], models })

export const render = (args => ({
	components: { BaseTreeSelect },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseTreeSelect>['render']
