import { SECTIONS } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseList.stories'
import BaseList from '../../../ui/BaseList.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-list', viewport: 'story-themed-viewport', title: 'story-themed-title' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
		<BaseList v-bind="args" label="По умолчанию" />
		<div style="--rise-list-bg: var(--rise-bg-elevated); --rise-list-border: var(--rise-primary); --rise-list-radius: var(--rise-radius-xl); --rise-list-shadow: var(--rise-shadow-md); --rise-list-item-radius: var(--rise-radius-lg); --rise-list-item-height: 48px; --rise-list-item-padding-x: 16px; --rise-list-item-bg-selected: var(--rise-success-soft);">
			<BaseList v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseList v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { items: SECTIONS, selectionMode: 'single', modelValue: 'calendar' },
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-list-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: область — `bg`, `border`, `radius`, `shadow`; строка —',
					'`item-text`, `item-bg-hover`, `item-bg-selected`, `item-radius`, `item-height`, `item-padding-x`, `item-padding-y`,',
					'`item-gap`. Отступы умножаются на плотность `--rise-density`. Проп `ui` добавляет классы к частям `root`, `label`,',
					'`viewport`, `list`, `item`, `grip`, `prefix`, `text`, `title`, `description`, `meta`, `check`, `actions`, `empty`,',
					'`error`, `ghost`; глобально — `defaults.BaseList.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseList'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	render: args => ({
		components: { BaseList },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-list')]
		const style = (root: HTMLElement, selector: string) => getComputedStyle(root.querySelector(selector)!)

		await expect(style(themed, '.base-list__viewport').backgroundColor).not.toBe(style(plain, '.base-list__viewport').backgroundColor)
		await expect(style(themed, '.base-list__viewport').borderTopColor).not.toBe(style(plain, '.base-list__viewport').borderTopColor)
		await expect(style(themed, '.base-list__viewport').boxShadow).not.toBe('none')
		await expect(style(themed, '.base-list__item--selected').backgroundColor).not.toBe(
			style(plain, '.base-list__item--selected').backgroundColor,
		)
		if (!isStoryBranded()) await expect(style(themed, '.base-list__item').minHeight).toBe('48px')
		if (!isStoryBranded()) await expect(style(themed, '.base-list__item').paddingInlineStart).toBe('16px')
		if (!isStoryBranded()) await expect(style(plain, '.base-list__item').paddingInlineStart).toBe('10px')
		await expect(classed).toHaveClass('base-list', 'story-themed-list')
		await expect(classed.querySelector('.base-list__viewport')).toHaveClass('story-themed-viewport')
		await expect(classed.querySelector('.base-list__title')).toHaveClass('story-themed-title')
	},
}
