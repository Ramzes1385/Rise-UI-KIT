import { expect } from 'storybook/test'
import type meta from '../../BaseContainer.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseContainer from '../../../ui/BaseContainer.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-container' }

const template = `
	<div class="story-stack">
		<BaseContainer v-bind="args">
			<div style="padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: 8px">По умолчанию</div>
		</BaseContainer>
		<div style="--rise-container-width: 480px; --rise-container-padding-x: 8px;">
			<BaseContainer v-bind="args">
				<div style="padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: 8px">Токены на контейнере</div>
			</BaseContainer>
		</div>
		<BaseContainer v-bind="args" :ui="ui">
			<div style="padding: 16px; border: 1px dashed var(--rise-border-accented); border-radius: 8px">Классы через ui</div>
		</BaseContainer>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['size', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Ширина и отступы без пропов. Токены `--rise-container-*` кит только читает: `width` — наибольшая ширина',
					'(для `sm`…`xl`, у `full` ограничения нет), `padding-x` — боковой отступ на любом экране вместо 16/24/32px.',
					'Задайте их на `:root`, в теме или на обёртке. Список — docs/design/COMPONENT_TOKENS.md.',
					'Проп `ui` добавляет классы к корню (`root`); глобально — `defaults.BaseContainer.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseContainer'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseContainer },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-container')]

		await expect(getComputedStyle(themed).maxWidth).not.toBe(getComputedStyle(plain).maxWidth)
		await expect(getComputedStyle(themed).paddingLeft).not.toBe(getComputedStyle(plain).paddingLeft)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).maxWidth).toBe('480px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingLeft).toBe('8px')
		await expect(classed).toHaveClass('base-container', 'story-themed-container')
	},
}
