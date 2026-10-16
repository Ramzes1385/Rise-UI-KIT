import { expect } from 'storybook/test'
import type meta from '../../BaseGrid.stories'
import BaseGrid from '../../../ui/BaseGrid.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-grid' }

const template = `
	<div class="story-stack">
		<BaseGrid v-bind="args" :cols="{ base: 2, md: 4 }">
			<div v-for="n in 4" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">По умолчанию</div>
		</BaseGrid>
		<div style="--rise-grid-gap: 40px;">
			<BaseGrid v-bind="args" :cols="{ base: 2, md: 4 }">
				<div v-for="n in 4" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Токен на обёртке</div>
			</BaseGrid>
		</div>
		<BaseGrid v-bind="args" :cols="{ base: 2, md: 4 }" :ui="ui">
			<div v-for="n in 4" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Классы через ui</div>
		</BaseGrid>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['gap', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Промежуток без пропов. Токен `--rise-grid-gap` кит только читает: он задаёт промежуток между колонками и строками для любого `gap`,',
					'кроме `none`; `rowGap` его не использует. Задайте токен на `:root`, в теме или на обёртке; отступы умножаются на `sizeScale` и плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к корню (`root`); глобально — `defaults.BaseGrid.ui` плагина. Список токенов — docs/design/COMPONENT_TOKENS.md.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseGrid'],
				script: `const ui = ${literal(ui)}`,
				omit: ['cols'],
			}),
		},
	},
	render: args => ({
		components: { BaseGrid },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-grid')]
		await expect(getComputedStyle(themed).columnGap).not.toBe(getComputedStyle(plain).columnGap)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).columnGap).toBe('40px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).columnGap).toBe('16px')
		await expect(classed).toHaveClass('base-grid', 'story-themed-grid')
	},
}
