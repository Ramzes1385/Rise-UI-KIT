import BaseMenu from '../ui/BaseMenu.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 240px;"><BaseMenu v-bind="args" /></div>
`

export const source = storySource({ template, imports: ['BaseMenu'] })

export const render = (args => ({
	components: { BaseMenu },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseMenu>['render']
