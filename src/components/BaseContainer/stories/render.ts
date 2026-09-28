import { DEMO_STYLE } from './shared'
import type { Meta } from '@storybook/vue3-vite'
import BaseContainer from '../ui/BaseContainer.vue'
import { useArgsWithoutSlots } from '@/stories/helpers'

export const render = (args => ({
	components: { BaseContainer },
	setup: () => ({ props: useArgsWithoutSlots(args), demoStyle: DEMO_STYLE }),
	template: `
			<BaseContainer v-bind="props">
				<div :style="demoStyle">
					<h2 style="margin: 0 0 8px">Отчёт за сентябрь</h2>
					<p style="margin: 0">Текст не растягивается на всю ширину широкого экрана: строки остаются удобной длины.</p>
				</div>
			</BaseContainer>
		`,
})) satisfies Meta<typeof BaseContainer>['render']
