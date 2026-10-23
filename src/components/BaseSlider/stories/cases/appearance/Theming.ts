import { SLIDES } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseSlider.stories'
import BaseSlider from '../../../ui/BaseSlider.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-slider', viewport: 'story-themed-viewport', dot: 'story-themed-dot' }

const template = `
	<div class="story-stack">
		<BaseSlider v-bind="args" label="По умолчанию" />
		<div style="--rise-slider-viewport-radius: var(--rise-radius-2xl); --rise-slider-viewport-bg: var(--rise-primary-soft); --rise-slider-dot-bg: var(--rise-primary-soft); --rise-slider-dot-bg-active: var(--rise-success); --rise-slider-dots-gap: 16px; --rise-slider-title-font-weight: var(--rise-font-weight-bold);">
			<BaseSlider v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseSlider v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['animation', 'navigation', 'isVertical', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-slider-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: окно `viewport-bg`, `viewport-radius`, слайд `slide-radius`',
					'(при `spaceBetween` и в эффектах `flip`, `cube`, `coverflow`, `cards`), заголовок подписи `title-font-weight`, точки `dot-bg`,',
					'`dot-bg-hover`, `dot-bg-active`, `dots-gap`, миниатюры `thumb-radius`, `thumb-border-active` (кольцо текущей), `thumbs-gap`.',
					'Отступы подписи и навигации умножаются на `--rise-density`.',
					'Проп `ui` добавляет классы к частям `root`, `body`, `stage`, `rotation`, `arrows`, `arrow`, `viewport`, `track`, `slide`,',
					'`video`, `image`, `caption`, `title`, `desc`, `navigation`, `dots`, `dot`, `thumbs`, `thumb`, `thumb-image`, `thumb-play`;',
					'глобально — `defaults.BaseSlider.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseSlider'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	args: { items: SLIDES.slice(0, 3), height: '180px' },
	render: args => ({
		components: { BaseSlider },
		setup: useStorySetup(args, { data: { ui }, slots: ['label'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-slider')]
		const style = (root: HTMLElement, part: string, pseudo?: string) =>
			getComputedStyle(root.querySelector(`.base-slider__${part}`)!, pseudo)

		await expect(style(themed, 'viewport').backgroundColor).not.toBe(style(plain, 'viewport').backgroundColor)
		await expect(style(themed, 'dot--active', '::before').backgroundColor).not.toBe(
			style(plain, 'dot--active', '::before').backgroundColor,
		)
		await expect(style(themed, 'title').fontWeight).toBe('700')
		if (!isStoryBranded()) await expect(style(plain, 'title').fontWeight).toBe('600')
		if (!isStoryBranded()) await expect(style(themed, 'viewport').borderTopLeftRadius).toBe('16px')
		if (!isStoryBranded()) await expect(style(plain, 'viewport').borderTopLeftRadius).toBe('8px')
		if (!isStoryBranded()) await expect(style(themed, 'dots').columnGap).toBe('16px')
		await expect(classed).toHaveClass('base-slider', 'story-themed-slider')
		await expect(classed.querySelector('.base-slider__viewport')).toHaveClass('story-themed-viewport')
		for (const dot of classed.querySelectorAll('.base-slider__dot')) await expect(dot).toHaveClass('story-themed-dot')
	},
}
