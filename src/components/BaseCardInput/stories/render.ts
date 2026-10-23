import type { Meta } from '@storybook/vue3-vite'
import BaseCardInput from '../ui/BaseCardInput.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<div class="story-narrow"><BaseCardInput v-bind="args" /></div>`

export const source = storySource({ template, imports: ['BaseCardInput'] })

export const render = (args => ({
	components: { BaseCardInput },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseCardInput>['render']
