import { expect } from 'storybook/test'
import type meta from '../../BaseEmpty.stories'
import BaseEmpty from '../../../ui/BaseEmpty.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-empty', title: 'story-themed-title', 'icon-wrapper': 'story-themed-icon' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
		<BaseEmpty v-bind="args" title="По умолчанию" />
		<div style="--rise-empty-bg: var(--rise-bg-elevated); --rise-empty-border: var(--rise-primary); --rise-empty-radius: var(--rise-radius-xl); --rise-empty-padding-y: 24px; --rise-empty-gap: 8px; --rise-empty-icon-text: var(--rise-primary); --rise-empty-icon-size: 40px; --rise-empty-title-font-size: var(--rise-font-size-lg); --rise-empty-description-font-size: var(--rise-font-size-xs);">
			<BaseEmpty v-bind="args" title="Токены на контейнере" />
		</div>
		<BaseEmpty v-bind="args" title="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'icon', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-empty-*` кит только читает —',
					'задайте их на `:root`, в теме или на контейнере: `bg`, `text`, `border`, `radius`, `padding-x`, `padding-y`, `gap`',
					'(отступы умножаются на плотность `--rise-density`), иконка — `icon-text`, `icon-size`, заголовок — `title-text`,',
					'`title-font-size`, описание — `description-font-size` (цвет описания — `text`). Проп `ui` добавляет классы к частям',
					'`root`, `icon-wrapper`, `content`, `title`, `description`, `body`, `actions`; глобально — `defaults.BaseEmpty.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseEmpty'], script: `const ui = ${literal(ui)}`, omit: ['title'] }),
		},
	},
	render: args => ({
		components: { BaseEmpty },
		setup: useStorySetup(args, { data: { ui }, slots: ['title'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-empty')]
		const part = (empty: HTMLElement, selector: string) => getComputedStyle(empty.querySelector(selector)!)

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopColor).not.toBe(getComputedStyle(plain).borderTopColor)
		await expect(part(themed, '.base-empty__icon-wrapper').color).not.toBe(part(plain, '.base-empty__icon-wrapper').color)
		await expect(part(themed, '.base-icon__svg').width).toBe('40px')
		await expect(parseFloat(part(themed, '.base-empty__title').fontSize)).toBeGreaterThan(
			parseFloat(part(plain, '.base-empty__title').fontSize),
		)
		await expect(parseFloat(part(themed, '.base-empty__description').fontSize)).toBeLessThan(
			parseFloat(part(plain, '.base-empty__description').fontSize),
		)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('12px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('24px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingTop).toBe('32px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).rowGap).toBe('8px')
		await expect(classed).toHaveClass('base-empty', 'story-themed-empty')
		await expect(classed.querySelector('.base-empty__title')).toHaveClass('story-themed-title')
		await expect(classed.querySelector('.base-empty__icon-wrapper')).toHaveClass('story-themed-icon')
	},
}
