import type { SearchArgs } from './shared'
import BaseSearch from '../ui/BaseSearch.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { query: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseSearch v-bind="args" v-model="query" /></div>
`

export const source = storySource({ template, imports: ['BaseSearch'], models })

export const render = (args => ({
	components: { BaseSearch },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<SearchArgs>['render']
