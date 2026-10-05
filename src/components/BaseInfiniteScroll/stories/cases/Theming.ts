import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseInfiniteScroll.stories'
import BaseInfiniteScroll from '../../ui/BaseInfiniteScroll.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-feed', footer: 'story-themed-footer', message: 'story-themed-message' }

const template = `
	<div class="story-grid" style="--story-grid-min: 220px; align-items: start;">
		<BaseInfiniteScroll v-bind="args" @load="({ done }) => done('empty')">
			<ul style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 8px">
				<li>Заказ № 1000</li>
				<li>Заказ № 1001</li>
			</ul>
		</BaseInfiniteScroll>
		<div style="--rise-infinite-scroll-footer-bg: var(--rise-bg-elevated); --rise-infinite-scroll-footer-text: var(--rise-primary); --rise-infinite-scroll-footer-height: 64px; --rise-infinite-scroll-footer-padding-y: 16px; --rise-infinite-scroll-footer-gap: 4px; --rise-infinite-scroll-footer-font-size: var(--rise-font-size-xs);">
			<BaseInfiniteScroll v-bind="args" @load="({ done }) => done('empty')">
				<ul style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 8px">
					<li>Заказ № 1000</li>
					<li>Заказ № 1001</li>
				</ul>
			</BaseInfiniteScroll>
		</div>
		<BaseInfiniteScroll v-bind="args" :ui="ui" @load="({ done }) => done('empty')">
			<ul style="margin: 0; padding: 8px 16px; list-style: none; display: grid; gap: 8px">
				<li>Заказ № 1000</li>
				<li>Заказ № 1001</li>
			</ul>
		</BaseInfiniteScroll>
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	args: { mode: 'manual' },
	parameters: {
		controls: { include: ['mode', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-infinite-scroll-*`',
					'кит только читает — задайте их на `:root`, в теме или на контейнере. Все они — у строки состояния под списком:',
					'`footer-bg`, `footer-text`, `footer-font-size`, `footer-gap`, `footer-padding-y`, `footer-height` (наименьшая высота,',
					'пока строка не пуста). Отступы умножаются на `--rise-density`. Проп `ui` добавляет классы к частям `root`, `sentinel`,',
					'`footer`, `loader`, `message`; глобально — `defaults.BaseInfiniteScroll.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseInfiniteScroll'], script: `const ui = ${literal(ui)}` }),
		},
	},
	render: args => ({
		components: { BaseInfiniteScroll },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-infinite-scroll__footer')]

		await expect(getComputedStyle(themed).backgroundColor).not.toBe(getComputedStyle(plain).backgroundColor)
		await expect(getComputedStyle(themed).color).not.toBe(getComputedStyle(plain).color)
		if (!isStoryBranded()) await expect(getComputedStyle(themed).paddingTop).toBe('16px')
		if (!isStoryBranded()) await expect(getComputedStyle(plain).paddingTop).toBe('8px')
		if (!isStoryBranded()) await expect(getComputedStyle(themed).minHeight).toBe('64px')
		await expect(classed).toHaveClass('base-infinite-scroll__footer', 'story-themed-footer')
		await expect(classed.closest('.base-infinite-scroll')).toHaveClass('story-themed-feed')
		await expect(classed.querySelector('.base-infinite-scroll__message')).toHaveClass('story-themed-message')
	},
}
