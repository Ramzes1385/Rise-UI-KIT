import type { Meta } from '@storybook/vue3-vite'
import BaseTimePicker from '../ui/BaseTimePicker.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { time: 'modelValue' }

const template = `
	<div class="story-narrow" style="max-width: 220px;"><BaseTimePicker v-bind="args" v-model="time" /></div>
`

export const source = storySource({ template, imports: ['BaseTimePicker'], models })

export const render = (args => ({
	components: { BaseTimePicker },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseTimePicker>['render']
