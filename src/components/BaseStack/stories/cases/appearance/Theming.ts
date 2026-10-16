import { expect } from 'storybook/test'
import type meta from '../../BaseStack.stories'
import BaseStack from '../../../ui/BaseStack.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-stack' }

const template = `
	<div class="story-stack">
		<BaseStack v-bind="args" direction="row" is-wrap>
			<div v-for="n in 3" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">По умолчанию</div>
		</BaseStack>
		<div style="--rise-stack-gap: 40px;">
			<BaseStack v-bind="args" direction="row" is-wrap>
				<div v-for="n in 3" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Токен на обёртке</div>
			</BaseStack>
		</div>
		<BaseStack v-bind="args" direction="row" is-wrap :ui="ui">
			<div v-for="n in 3" :key="n" style="padding: 8px 16px; border: 1px solid var(--rise-border); border-radius: 8px; background: var(--rise-bg-elevated)">Классы через ui</div>
		</BaseStack>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['gap', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Промежуток без пропов. Токен `--rise-stack-gap` кит только читает: он задаёт промежуток для любого `gap`, кроме `none`',
					'(у `gap="none"` промежутка нет). Задайте его на `:root`, в теме или на обёртке; отступы умножаются на `sizeScale` и плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к корню (`root`); глобально — `defaults.BaseStack.ui` плагина. Список токенов — docs/design/COMPONENT_TOKENS.md.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseStack'],
				script: `const ui = ${literal(ui)}`,
				omit: ['direction', 'isWrap'],
			}),
		},
	},
	render: args => ({
		components: { BaseStack },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-stack')]
		await expect(getComputedStyle(themed).columnGap).not.toBe(getComputedStyle(plain).columnGap)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).columnGap).toBe('40px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).columnGap).toBe('16px')
		await expect(classed).toHaveClass('base-stack', 'story-themed-stack')
	},
}
