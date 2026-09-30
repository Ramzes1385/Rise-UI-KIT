import type { Meta } from '@storybook/vue3-vite'
import BaseCheckboxGroup from '../ui/BaseCheckboxGroup.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { selected: 'modelValue' }

const template = `
	<BaseCheckboxGroup v-bind="args" v-model="selected" />
`

export const source = storySource({ template, imports: ['BaseCheckboxGroup'], models })

export const render = (args => ({
	components: { BaseCheckboxGroup },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseCheckboxGroup>['render']
