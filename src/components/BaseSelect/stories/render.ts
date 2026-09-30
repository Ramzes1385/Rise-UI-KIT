import BaseSelect from '../ui/BaseSelect.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { selected: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseSelect v-bind="args" v-model="selected" /></div>
`

export const source = storySource({ template, imports: ['BaseSelect'], models })

export const render = (args => ({
	components: { BaseSelect },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseSelect>['render']
