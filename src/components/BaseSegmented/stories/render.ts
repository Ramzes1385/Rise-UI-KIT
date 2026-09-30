import type { Meta } from '@storybook/vue3-vite'
import BaseSegmented from '../ui/BaseSegmented.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { selected: 'modelValue' }

const template = `
	<BaseSegmented v-bind="args" v-model="selected" />
`

export const source = storySource({ template, imports: ['BaseSegmented'], models })

export const render = (args => ({
	components: { BaseSegmented },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseSegmented>['render']
