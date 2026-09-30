import BaseEmpty from '../ui/BaseEmpty.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-medium"><BaseEmpty v-bind="args" /></div>
`

export const source = storySource({ template, imports: ['BaseEmpty'] })

export const render = (args => ({
	components: { BaseEmpty },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseEmpty>['render']
