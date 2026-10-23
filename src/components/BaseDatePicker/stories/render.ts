import type { Meta } from '@storybook/vue3-vite'
import BaseDatePicker from '../ui/BaseDatePicker.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { date: 'modelValue' }

const template = `
	<div class="story-narrow"><BaseDatePicker v-bind="args" v-model="date" /></div>
`

export const source = storySource({ template, imports: ['BaseDatePicker'], models })

export const render = (args => ({
	components: { BaseDatePicker },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseDatePicker>['render']
