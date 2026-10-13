import BaseStack from '../ui/BaseStack.vue'
import type { Meta } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseStack v-bind="args">
		<div v-for="n in 3" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Блок {{ n }}</div>
	</BaseStack>
`

export const source = storySource({ template, imports: ['BaseStack'] })

export const render = (args => ({
	components: { BaseStack },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseStack>['render']
