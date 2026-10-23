import BaseChart from '../ui/BaseChart.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `<BaseChart v-bind="args" />`

export const source = storySource({ template, imports: ['BaseChart'] })

export const render = (args => ({
	components: { BaseChart },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseChart>['render']
