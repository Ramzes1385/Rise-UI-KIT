import type { Meta } from '@storybook/vue3-vite'
import BaseContainer from '../ui/BaseContainer.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseContainer v-bind="args">
		<div style="padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: 8px">
			<h2 style="margin: 0 0 8px">Отчёт за сентябрь</h2>
			<p style="margin: 0">Текст не растягивается на всю ширину широкого экрана: строки остаются удобной длины.</p>
		</div>
	</BaseContainer>
`

export const source = storySource({ template, imports: ['BaseContainer'] })

export const render = (args => ({
	components: { BaseContainer },
	setup: useStorySetup(args),
	template,
})) satisfies Meta<typeof BaseContainer>['render']
