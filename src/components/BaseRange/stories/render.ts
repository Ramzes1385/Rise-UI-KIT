import BaseRange from '../ui/BaseRange.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseRange v-bind="args" v-model="value" /></div>
`

export const source = storySource({ template, imports: ['BaseRange'], models, omit: ['thumb'] })

export const render = (args => ({
	components: { BaseRange },
	setup: useStorySetup(args, { models, slots: ['thumb'] }),
	template,
})) satisfies Meta<typeof BaseRange>['render']
