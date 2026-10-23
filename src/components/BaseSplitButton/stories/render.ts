import type { Meta } from '@storybook/vue3-vite'
import BaseSplitButton from '../ui/BaseSplitButton.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseSplitButton v-bind="args" />
`

export const source = storySource({ template, imports: ['BaseSplitButton'] })

export const render = (args => ({
	components: { BaseSplitButton },
	setup: useStorySetup(args, { slots: [] }),
	template,
})) satisfies Meta<typeof BaseSplitButton>['render']
