import type { Meta } from '@storybook/vue3-vite'
import BaseAccordion from '../ui/BaseAccordion.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-medium"><BaseAccordion v-bind="args" /></div>
`

export const source = storySource({ template, imports: ['BaseAccordion'] })

export const render = (args => ({
	components: { BaseAccordion },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseAccordion>['render']
