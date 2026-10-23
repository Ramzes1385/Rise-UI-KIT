import { expect } from 'storybook/test'
import { showcaseItems } from '../../shared'
import type meta from '../../BaseAccordion.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseAccordion from '../../../ui/BaseAccordion.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-accordion', header: 'story-themed-header', content: 'story-themed-content' }
const themedItems = showcaseItems(1)
const classedItems = showcaseItems(2)

const template = `
	<div class="story-grid" style="--story-grid-min: 280px;">
		<div class="story-col">
			<span class="story-label">По умолчанию</span>
			<BaseAccordion v-bind="args" />
		</div>
		<div class="story-col" style="--rise-accordion-header-text: var(--rise-primary-text); --rise-accordion-border: var(--rise-primary); --rise-accordion-header-padding-y: 20px; --rise-accordion-header-font-weight: var(--rise-font-weight-bold); --rise-accordion-content-text: var(--rise-text);">
			<span class="story-label">Токены на контейнере</span>
			<BaseAccordion v-bind="args" :items="themedItems" />
		</div>
		<div class="story-col">
			<span class="story-label">Классы через ui</span>
			<BaseAccordion v-bind="args" :items="classedItems" :ui="ui" />
		</div>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-accordion-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `bg`, `border` (линии и рамка), `radius`, `shadow`, `gap`',
					'(между карточками `separated`), `header-padding-x`, `header-padding-y`, `header-text`, `header-bg-hover`,',
					'`header-font-size`, `header-font-weight`, `content-text`. Отступы умножаются на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям `root`, `item`, `heading`, `header`, `icon`, `title`, `label`, `description`, `arrow`,',
					'`collapse`, `content`, `text`; глобально — `defaults.BaseAccordion.ui` плагина.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseAccordion'],
				script: [
					`const ui = ${literal(ui)}`,
					`const themedItems = ${literal(themedItems)}`,
					`const classedItems = ${literal(classedItems)}`,
				].join('\n'),
			}),
		},
	},
	render: args => ({
		components: { BaseAccordion },
		setup: useStorySetup(args, { data: { ui, themedItems, classedItems } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-accordion')]
		const header = (root: HTMLElement) => root.querySelector<HTMLElement>('.base-accordion__header')!

		await expect(getComputedStyle(header(themed)).color).not.toBe(getComputedStyle(header(plain)).color)
		await expect(getComputedStyle(header(themed)).fontWeight).toBe('700')
		await expect(getComputedStyle(header(plain)).fontWeight).toBe('500')
		if (!isStoryBranded()) {
			await expect(getComputedStyle(header(plain)).paddingTop).toBe('14px')
			await expect(getComputedStyle(header(themed)).paddingTop).toBe('20px')
		}
		await expect(classed).toHaveClass('base-accordion', 'story-themed-accordion')
		for (const part of classed.querySelectorAll('.base-accordion__header')) await expect(part).toHaveClass('story-themed-header')
		for (const part of classed.querySelectorAll('.base-accordion__content')) await expect(part).toHaveClass('story-themed-content')
	},
}
