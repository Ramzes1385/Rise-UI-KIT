import BaseInplace from '../ui/BaseInplace.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { value: 'modelValue' }

const template = `
	<BaseInplace v-bind="args" v-model="value" />
`

export const source = storySource({ template, imports: ['BaseInplace'], models })

export const render = (args => ({
	components: { BaseInplace },
	setup: useStorySetup(args, { models, slots: [] }),
	template,
})) satisfies Meta<typeof BaseInplace>['render']
