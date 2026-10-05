import { expect } from 'storybook/test'
import type meta from '../../BasePieChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePieChart from '../../../ui/BasePieChart.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-pie', legend: 'story-themed-legend', value: 'story-themed-value' }

const template = `
	<div class="story-stack">
		<BasePieChart v-bind="args" />
		<div style="--rise-pie-chart-track-bg: var(--rise-primary-soft); --rise-pie-chart-center-text: var(--rise-primary); --rise-pie-chart-center-font-weight: var(--rise-font-weight-bold); --rise-pie-chart-value-text: var(--rise-primary); --rise-pie-chart-value-font-weight: var(--rise-font-weight-bold); --rise-pie-chart-item-radius: var(--rise-radius-full); --rise-pie-chart-item-padding-x: 12px; --rise-pie-chart-legend-gap: 2px; --rise-pie-chart-gap: 40px;">
			<BasePieChart v-bind="args" />
		</div>
		<BasePieChart v-bind="args" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'size', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-pie-chart-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: `text`, `gap` (между диаграммой и легендой), кольцо-подложка',
					'`track-bg`, итог в центре `center-text`, `center-font-weight`, легенда `legend-gap`, строка легенды `item-padding-x`,',
					'`item-padding-y`, `item-radius`, `item-bg-active` (подсветка при наведении), значение `value-text`, `value-font-weight`.',
					'Отступы умножаются на `--rise-density`. Цвета частей — `--rise-chart-1…8` или `color` у части.',
					'Проп `ui` добавляет классы к частям `root`, `chart`, `svg`, `track`, `segment`, `center`, `legend`, `item`, `swatch`,',
					'`name`, `value`, `percent`; глобально — `defaults.BasePieChart.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BasePieChart'], script: `const ui = ${literal(ui)}` }),
		},
	},
	args: { animation: 'none' },
	render: args => ({
		components: { BasePieChart },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-pie-chart')]
		const style = (root: HTMLElement, part: string) => getComputedStyle(root.querySelector(`.base-pie-chart__${part}`)!)

		await expect(style(themed, 'track').stroke).not.toBe(style(plain, 'track').stroke)
		await expect(style(themed, 'value').color).not.toBe(style(plain, 'value').color)
		await expect(style(themed, 'value').fontWeight).toBe('700')
		if (!isStoryBranded()) await expect(style(plain, 'value').fontWeight).toBe('500')
		if (!isStoryBranded()) await expect(style(themed, 'item').paddingLeft).toBe('12px')
		if (!isStoryBranded()) await expect(style(plain, 'item').paddingLeft).toBe('6px')
		if (!isStoryBranded()) await expect(style(themed, 'item').borderTopLeftRadius).toBe('9999px')
		if (!isStoryBranded()) await expect(style(themed, 'legend').rowGap).toBe('2px')
		await expect(classed).toHaveClass('base-pie-chart', 'story-themed-pie')
		await expect(classed.querySelector('.base-pie-chart__legend')).toHaveClass('story-themed-legend')
		for (const value of classed.querySelectorAll('.base-pie-chart__value')) await expect(value).toHaveClass('story-themed-value')
	},
}
