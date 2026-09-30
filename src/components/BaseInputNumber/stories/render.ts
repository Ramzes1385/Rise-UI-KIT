import type { Meta } from '@storybook/vue3-vite'
import BaseInputNumber from '../ui/BaseInputNumber.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `
	<div class="story-narrow" style="max-width: 200px;"><BaseInputNumber v-bind="args" v-model="value" /></div>
`

export const source = storySource({ template, imports: ['BaseInputNumber'], models })

export const render = (args => ({
	components: { BaseInputNumber },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseInputNumber>['render']
