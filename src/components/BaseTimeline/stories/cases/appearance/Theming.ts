import { expect } from 'storybook/test'
import type meta from '../../BaseTimeline.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseTimeline from '../../../ui/BaseTimeline.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-timeline', marker: 'story-themed-marker', title: 'story-themed-title' }

const template = `
	<div class="story-grid" style="--story-grid-min: 240px; align-items: start;">
		<BaseTimeline v-bind="args" />
		<div style="--rise-timeline-marker-bg: var(--rise-bg-inverted); --rise-timeline-marker-text: var(--rise-text-inverted); --rise-timeline-marker-radius: var(--rise-radius-sm); --rise-timeline-marker-height: 20px; --rise-timeline-line-bg: var(--rise-primary); --rise-timeline-gap: 12px; --rise-timeline-title-font-weight: var(--rise-font-weight-bold);">
			<BaseTimeline v-bind="args" />
		</div>
		<BaseTimeline v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-timeline-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `gap` (между событиями), `item-gap` (маркер — текст),',
					'`marker-bg`, `marker-text`, `marker-radius`, `marker-height` (размер круга; линия встаёт по нему), `dot-height`, `line-bg`,',
					'`title-text`, `title-font-size`, `title-font-weight`, `description-text`. Отступы умножаются на плотность `--rise-density`.',
					'Проп `ui` добавляет классы к частям `root`, `item`, `date`, `marker`, `icon`, `dot`, `line`, `content`, `day`, `title`,',
					'`description`, `media`; глобально — `defaults.BaseTimeline.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseTimeline'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseTimeline },
		setup: useStorySetup(args, { data: { ui }, slots: [] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-timeline')]
		const style = (root: HTMLElement, part: string) => getComputedStyle(root.querySelector(`.base-timeline__${part}`)!)

		await expect(style(themed, 'marker').backgroundColor).not.toBe(style(plain, 'marker').backgroundColor)
		await expect(style(themed, 'line').backgroundColor).not.toBe(style(plain, 'line').backgroundColor)
		await expect(style(themed, 'title').fontWeight).toBe('700')
		await expect(style(themed, 'marker').borderTopLeftRadius).not.toBe('50%')
		if (!isStoryBranded()) await expect(style(themed, 'marker').width).toBe('20px')
		if (!isStoryBranded()) await expect(style(plain, 'marker').width).toBe('24px')
		if (!isStoryBranded()) await expect(style(themed, 'item').paddingBottom).toBe('12px')
		await expect(classed).toHaveClass('base-timeline', 'story-themed-timeline')
		await expect(classed.querySelector('.base-timeline__marker')).toHaveClass('story-themed-marker')
		await expect(classed.querySelector('.base-timeline__title')).toHaveClass('story-themed-title')
	},
}
