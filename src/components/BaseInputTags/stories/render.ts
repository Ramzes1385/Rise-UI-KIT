import type { Meta } from '@storybook/vue3-vite'
import BaseInputTags from '../ui/BaseInputTags.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { tags: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseInputTags v-bind="args" v-model="tags" /></div>
`

export const source = storySource({ template, imports: ['BaseInputTags'], models })

export const render = (args => ({
	components: { BaseInputTags },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseInputTags>['render']
