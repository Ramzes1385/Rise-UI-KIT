import BaseKbd from '../ui/BaseKbd.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseKbd v-bind="args" />
`

export const source = storySource({ template, imports: ['BaseKbd'] })

export const render = (args => ({
	components: { BaseKbd },
	setup: useStorySetup(args, { slots: [] }),
	template,
})) satisfies Meta<typeof BaseKbd>['render']
