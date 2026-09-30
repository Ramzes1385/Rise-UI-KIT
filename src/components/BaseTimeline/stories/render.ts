import type { Meta } from '@storybook/vue3-vite'
import BaseTimeline from '../ui/BaseTimeline.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-narrow"><BaseTimeline v-bind="args" /></div>
`

export const source = storySource({ template, imports: ['BaseTimeline'] })

export const render = (args => ({
	components: { BaseTimeline },
	setup: useStorySetup(args, { slots: [] }),
	template,
})) satisfies Meta<typeof BaseTimeline>['render']
