import { expect } from 'storybook/test'
import type meta from '../../BaseCode.stories'
import BaseCode from '../../../ui/BaseCode.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-code', header: 'story-themed-header', line: 'story-themed-line' }

const template = `
	<div class="story-grid" style="--story-grid-min: 280px; align-items: start;">
		<BaseCode v-bind="args" title="По умолчанию" />
		<div style="--rise-code-bg: var(--rise-bg); --rise-code-border: var(--rise-primary); --rise-code-radius: var(--rise-radius-xl); --rise-code-header-bg: var(--rise-primary-soft); --rise-code-header-text: var(--rise-text-highlighted); --rise-code-copy-text: var(--rise-text-highlighted); --rise-code-font-size: var(--rise-font-size-sm); --rise-code-padding-y: 16px; --rise-code-padding-x: 20px;">
			<BaseCode v-bind="args" title="Токены на контейнере" />
		</div>
		<BaseCode v-bind="args" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { code: 'const total = items.length\nconsole.log(`Всего: ${total}`)', language: 'js' },
	parameters: {
		controls: { include: ['variant', 'sizeScale', 'hasLineNumbers'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-code-*` кит только читает —',
					'задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `font-size`, `padding-x`, `padding-y`',
					'(отступы умножаются на плотность `--rise-density`), шапка — `header-bg`, `header-text`, `header-height`,',
					'кнопка «Копировать» — `copy-text`, `copy-radius`. Цвета подсветки — общие токены `--rise-code-keyword`, `-string` и другие.',
					'Проп `ui` добавляет классы к частям `root`, `header`, `title`, `copy`, `pre`, `code`, `line`, `number`, `text`, `empty`;',
					'глобально — `defaults.BaseCode.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseCode'], script: `const ui = ${literal(ui)}`, omit: ['title'] }),
		},
	},
	render: args => ({
		components: { BaseCode },
		setup: useStorySetup(args, { data: { ui }, slots: ['title'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-code')]
		const part = (code: HTMLElement, name: string) => getComputedStyle(code.querySelector(`.base-code__${name}`)!)

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(part(themed, 'header').backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
		await expect(part(plain, 'header').backgroundColor).toBe('rgba(0, 0, 0, 0)')
		await expect(part(themed, 'pre').fontSize).not.toBe(part(plain, 'pre').fontSize)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
		if (!isStoryBranded()) await expect(part(themed, 'pre').paddingTop).toBe('16px')
		if (!isStoryBranded()) await expect(part(plain, 'pre').paddingTop).toBe('12px')
		if (!isStoryBranded()) await expect(part(themed, 'line').paddingInlineStart).toBe('20px')
		await expect(classed).toHaveClass('base-code', 'story-themed-code')
		await expect(classed.querySelector('.base-code__header')).toHaveClass('story-themed-header')
		await expect(classed.querySelector('.base-code__line')).toHaveClass('story-themed-line')
	},
}
