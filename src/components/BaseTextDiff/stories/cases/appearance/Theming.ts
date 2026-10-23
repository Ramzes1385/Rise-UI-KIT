import { expect } from 'storybook/test'
import type meta from '../../BaseTextDiff.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTextDiff from '../../../ui/BaseTextDiff.vue'
import { SHORT_AFTER, SHORT_BEFORE } from '../../shared'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-diff', summary: 'story-themed-summary', word: 'story-themed-word' }

const template = `
	<div class="story-grid" style="--story-grid-min: 280px; align-items: start;">
		<BaseTextDiff v-bind="args" label="По умолчанию" />
		<div style="--rise-text-diff-bg: var(--rise-bg-elevated); --rise-text-diff-border: var(--rise-primary); --rise-text-diff-radius: var(--rise-radius-xl); --rise-text-diff-summary-bg: var(--rise-primary-soft); --rise-text-diff-summary-padding-x: 16px; --rise-text-diff-summary-padding-y: 10px; --rise-text-diff-font-size: var(--rise-font-size-sm); --rise-text-diff-added-bg: var(--rise-info-soft); --rise-text-diff-removed-bg: var(--rise-warning-soft);">
			<BaseTextDiff v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseTextDiff v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { before: SHORT_BEFORE, after: SHORT_AFTER },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'mode'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-text-diff-*` кит',
					'только читает — задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `font-size` (таблица',
					'строк), сводка — `summary-bg`, `summary-padding-x`, `summary-padding-y` (отступы умножаются на плотность `--rise-density`),',
					'фон строк — `added-bg`, `removed-bg`. Проп `ui` добавляет классы к частям `root`, `summary`, `count`, `same`, `table`,',
					'`head`, `row`, `number`, `sign`, `text`, `word`; глобально — `defaults.BaseTextDiff.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTextDiff'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	render: args => ({
		components: { BaseTextDiff },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-text-diff')]
		const part = (root: HTMLElement, selector: string) => getComputedStyle(root.querySelector(selector)!)

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(part(themed, '.base-text-diff__summary').backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
		await expect(part(plain, '.base-text-diff__summary').backgroundColor).toBe('rgba(0, 0, 0, 0)')
		await expect(part(themed, '.base-text-diff__cell--added').backgroundColor).not.toBe(
			part(plain, '.base-text-diff__cell--added').backgroundColor,
		)
		await expect(part(themed, '.base-text-diff__table').fontSize).not.toBe(part(plain, '.base-text-diff__table').fontSize)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
			await expect(part(plain, '.base-text-diff__summary').paddingInlineStart).toBe('12px')
			await expect(part(themed, '.base-text-diff__summary').paddingInlineStart).toBe('16px')
		}
		await expect(classed).toHaveClass('base-text-diff', 'story-themed-diff')
		await expect(classed.querySelector('.base-text-diff__summary')).toHaveClass('story-themed-summary')
		for (const word of classed.querySelectorAll('.base-text-diff__word')) await expect(word).toHaveClass('story-themed-word')
	},
}
