import type { Meta } from '@storybook/vue3-vite'
import BaseTextarea from '../ui/BaseTextarea.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { text: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseTextarea v-bind="args" v-model="text" /></div>
`

export const source = storySource({ template, imports: ['BaseTextarea'], models })

export const render = (args => ({
	components: { BaseTextarea },
	setup: useStorySetup(args, { models }),
	template,
})) satisfies Meta<typeof BaseTextarea>['render']
