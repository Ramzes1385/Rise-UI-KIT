import BaseUser from '../ui/BaseUser.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseUser v-bind="args" />
`

export const source = storySource({ template, imports: ['BaseUser'] })

export const render = (args => ({
	components: { BaseUser },
	setup: useStorySetup(args, { slots: [] }),
	template,
})) satisfies Meta<typeof BaseUser>['render']
