import type { Meta } from '@storybook/vue3-vite'
import BaseAutocomplete from '../ui/BaseAutocomplete.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseAutocomplete v-bind="args" v-model="value" /></div>
`

export const source = storySource({ template, imports: ['BaseAutocomplete'], models })

export const render = (args => ({
	components: { BaseAutocomplete },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseAutocomplete>['render']
