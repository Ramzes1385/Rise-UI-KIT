import BaseInput from '../ui/BaseInput.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseInput v-bind="args" v-model="value" /></div>
`

export const source = storySource({ template, imports: ['BaseInput'], models })

export const render = (args => ({
	components: { BaseInput },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseInput>['render']
