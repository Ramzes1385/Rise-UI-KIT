import { expect } from 'storybook/test'
import type meta from '../../BaseTreeSelect.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTreeSelect from '../../../ui/BaseTreeSelect.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-tree-select', trigger: 'story-themed-trigger', node: 'story-themed-node' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
		<BaseTreeSelect v-bind="args" label="По умолчанию" />
		<div style="--rise-tree-select-bg: var(--rise-bg-muted); --rise-tree-select-border: var(--rise-primary); --rise-tree-select-radius: var(--rise-radius-2xl); --rise-tree-select-padding-y: 12px; --rise-tree-select-node-bg-active: var(--rise-primary-soft);">
			<BaseTreeSelect v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseTreeSelect v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-tree-select-*` кит только читает — задайте их на `:root`, в теме или на контейнере:',
					'поле — `bg`, `text`, `border`, `border-focus`, `radius`, `padding-x`, `padding-y`; список — `node-radius`,',
					'`node-bg-active`, `checkbox-bg-checked` (список — docs/design/COMPONENT_TOKENS.md). Отступы панели умножаются на',
					'плотность темы `--rise-density`. Проп `ui` добавляет классы к частям (`root`, `trigger`, `panel`, `tree`, `node`… —',
					'`TREE_SELECT_PARTS`); для всех полей приложения — `defaults.BaseTreeSelect.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseTreeSelect'],
				script: `const ui = ${literal(ui)}`,
				omit: ['label', 'modelValue'],
			}),
		},
	},
	render: args => ({
		components: { BaseTreeSelect },
		setup: useStorySetup(args, { data: { ui }, slots: ['label', 'modelValue'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-tree-select')]
		const trigger = (field: HTMLElement) => field.querySelector<HTMLElement>('.base-tree-select__trigger')!

		await expect(getComputedStyle(trigger(themed)).backgroundColor).not.toBe(getComputedStyle(trigger(plain)).backgroundColor)
		await expect(getComputedStyle(trigger(themed)).borderTopColor).not.toBe(getComputedStyle(trigger(plain)).borderTopColor)
		if (!isStoryBranded()) await expect(getComputedStyle(trigger(themed)).borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(trigger(themed)).paddingTop).toBe('12px')
		await expect(classed).toHaveClass('base-tree-select', 'story-themed-tree-select')
		await expect(trigger(classed)).toHaveClass('base-tree-select__trigger', 'story-themed-trigger')
	},
}
