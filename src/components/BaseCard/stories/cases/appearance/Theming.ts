import { expect } from 'storybook/test'
import type meta from '../../BaseCard.stories'
import BaseCard from '../../../ui/BaseCard.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-card', body: 'story-themed-body' }

const template = `
	<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
		<BaseCard v-bind="args" title="По умолчанию">Тело карточки</BaseCard>
		<div style="--rise-card-bg: var(--rise-bg-muted); --rise-card-radius: var(--rise-radius-2xl); --rise-card-padding-y: 24px; --rise-card-header-bg: var(--rise-primary-soft);">
			<BaseCard v-bind="args" title="Токены на контейнере">Тело карточки</BaseCard>
		</div>
		<div style="--rise-density: 0.75;">
			<BaseCard v-bind="args" title="Плотность 0.75">Отступы × 0.75</BaseCard>
		</div>
		<BaseCard v-bind="args" title="Классы через ui" :ui="ui">Тело карточки</BaseCard>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов. Токены `--rise-card-*` (фон, текст, рамка, радиус, тень, отступы, шапка) кит только читает:',
					'задайте их на `:root`, в теме или на контейнере. Отступы умножаются на плотность темы `--rise-density`.',
					'Проп `ui` добавляет классы к частям (`root`, `header`, `header-text`, `title`, `subtitle`, `actions`, `body`, `footer`).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseCard'],
				script: `const ui = ${literal(ui)}`,
				omit: ['default', 'title', 'subtitle'],
			}),
		},
	},
	render: args => ({
		components: { BaseCard },
		setup: useStorySetup(args, { data: { ui }, slots: ['default', 'title', 'subtitle'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, dense, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-card')]
		const body = (card: HTMLElement) => getComputedStyle(card.querySelector('.base-card__body')!)

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).borderTopLeftRadius).toBe('16px')
		await expect(body(themed).paddingTop).toBe('24px')
		await expect(body(plain).paddingTop).toBe('16px')
		await expect(body(dense).paddingTop).toBe('12px')
		await expect(body(dense).paddingLeft).toBe('15px')
		await expect(getComputedStyle(themed.querySelector('.base-card__header')!).backgroundColor).not.toBe('rgba(0, 0, 0, 0)')
		await expect(classed).toHaveClass('base-card', 'story-themed-card')
		await expect(classed.querySelector('.base-card__body')).toHaveClass('story-themed-body')
	},
}
