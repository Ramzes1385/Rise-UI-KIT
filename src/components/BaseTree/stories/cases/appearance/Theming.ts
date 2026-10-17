import { expect } from 'storybook/test'
import { nodeHeader } from '../../shared'
import type meta from '../../BaseTree.stories'
import BaseTree from '../../../ui/BaseTree.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-tree', header: 'story-themed-header', children: 'story-themed-children' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px;">
		<div class="story-col">
			<span class="story-label">По умолчанию</span>
			<BaseTree v-bind="args" />
		</div>
		<div class="story-col" style="--rise-tree-border: var(--rise-primary); --rise-tree-item-bg-selected: var(--rise-primary); --rise-tree-item-text-selected: var(--rise-on-primary); --rise-tree-item-radius: var(--rise-radius-full); --rise-tree-item-padding-x: 12px; --rise-tree-children-border: var(--rise-primary-border); --rise-tree-children-padding-x: 8px;">
			<span class="story-label">Токены на контейнере</span>
			<BaseTree v-bind="args" />
		</div>
		<div class="story-col">
			<span class="story-label">Классы через ui</span>
			<BaseTree v-bind="args" :ui="ui" />
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { variant: 'outline', selectionMode: 'single', expandedIds: ['src', 'components'], selectedIds: ['app-vue'] },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-tree-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: корень — `bg`, `border` (рамка `outline` и `shadow`);',
					'строка узла — `item-bg-hover`, `item-bg-selected`, `item-text`, `item-text-selected`, `item-radius`, `item-height`',
					'(наименьшая высота), `item-padding-x`, `item-gap`; ветка — `children-border` (направляющая линия) и',
					'`children-padding-x` (отступ уровня после линии). Отступы умножаются на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям `root`, `node`, `header`, `arrow`, `checkbox`, `icon`, `label`, `link`, `actions`,',
					'`children`, `children-inner`, `row`; глобально — `defaults.BaseTree.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTree'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseTree },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-tree')]
		const selected = (root: HTMLElement) => nodeHeader(root, 'App.vue')
		const branch = (root: HTMLElement) => root.querySelector<HTMLElement>('.base-tree__children')!

		await expect(getComputedStyle(selected(themed)).backgroundColor).not.toBe(getComputedStyle(selected(plain)).backgroundColor)
		await expect(getComputedStyle(selected(themed)).color).not.toBe(getComputedStyle(selected(plain)).color)
		await expect(getComputedStyle(branch(themed)).borderInlineStartColor).not.toBe(
			getComputedStyle(branch(plain)).borderInlineStartColor,
		)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(selected(plain)).paddingInlineStart).toBe('8px')
			await expect(getComputedStyle(selected(themed)).paddingInlineStart).toBe('12px')
			await expect(getComputedStyle(branch(plain)).paddingInlineStart).toBe('4px')
			await expect(getComputedStyle(branch(themed)).paddingInlineStart).toBe('8px')
		}
		await expect(classed).toHaveClass('base-tree', 'story-themed-tree')
		for (const part of classed.querySelectorAll('.base-tree__header')) await expect(part).toHaveClass('story-themed-header')
		for (const part of classed.querySelectorAll('.base-tree__children')) await expect(part).toHaveClass('story-themed-children')
	},
}
