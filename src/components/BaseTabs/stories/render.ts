import BaseTabs from '../ui/BaseTabs.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { tab: 'modelValue' }

const template = `
	<BaseTabs v-bind="args" v-model="tab" />
`

export const source = storySource({ template, imports: ['BaseTabs'], models })

export const render = (args => ({
	components: { BaseTabs },
	setup: useStorySetup(args, { models, slots: ['default'] }),
	template,
})) satisfies Meta<typeof BaseTabs>['render']
