import BaseCard from '../ui/BaseCard.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div class="story-medium"><BaseCard v-bind="args">{{ slots.default }}</BaseCard></div>
`

export const source = storySource({ template, imports: ['BaseCard'] })

export const render = (args => ({
	components: { BaseCard },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseCard>['render']
