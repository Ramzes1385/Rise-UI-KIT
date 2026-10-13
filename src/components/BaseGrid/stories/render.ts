import BaseGrid from '../ui/BaseGrid.vue'
import type { Meta } from '@storybook/vue3-vite'
import { BaseGridItem } from '@components/BaseGrid'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseGrid v-bind="args">
		<BaseGridItem v-for="n in 6" :key="n" :span="4" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Ячейка {{ n }}</BaseGridItem>
	</BaseGrid>
`

export const source = storySource({ template, imports: ['BaseGrid', 'BaseGridItem'] })

export const render = (args => ({
	components: { BaseGrid, BaseGridItem },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseGrid>['render']
