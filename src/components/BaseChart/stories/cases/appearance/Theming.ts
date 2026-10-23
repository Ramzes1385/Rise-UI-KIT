import { MONTHS } from '../../shared'
import type meta from '../../BaseChart.stories'
import { expect, waitFor } from 'storybook/test'
import BaseChart from '../../../ui/BaseChart.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-chart', tooltip: 'story-themed-tooltip', legend: 'story-themed-legend', 'x-tick': 'story-themed-tick' }

const template = `
	<div class="story-stack">
		<BaseChart v-bind="args" label="По умолчанию" />
		<div style="--rise-chart-axis-text: var(--rise-primary-text); --rise-chart-axis-font-size: var(--rise-font-size-sm); --rise-chart-grid-border: var(--rise-primary-soft); --rise-chart-tooltip-bg: var(--rise-bg-elevated); --rise-chart-tooltip-text: var(--rise-primary-text); --rise-chart-tooltip-border: var(--rise-primary); --rise-chart-tooltip-radius: var(--rise-radius-lg); --rise-chart-tooltip-shadow: var(--rise-shadow-lg); --rise-chart-tooltip-padding-x: 16px; --rise-chart-tooltip-padding-y: 10px; --rise-chart-legend-gap: 8px 24px; --rise-chart-legend-text: var(--rise-primary-text);">
			<BaseChart v-bind="args" label="Токены на контейнере" />
		</div>
		<BaseChart v-bind="args" label="Классы через ui" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'isStacked', 'hasGrid', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-chart-*` кит только',
					'читает — задайте их на `:root`, в теме или на контейнере: оси `axis-text`, `axis-font-size`; сетка `grid-border`;',
					'подсказка `tooltip-bg`, `tooltip-text` (подпись точки и значения), `tooltip-border`, `tooltip-radius`, `tooltip-shadow`,',
					'`tooltip-padding-x`, `tooltip-padding-y`; легенда `legend-gap` (значение `gap` целиком), `legend-text`.',
					'Отступы подсказки умножаются на `--rise-density`. Цвета рядов — `--rise-chart-1…8` или `color` у ряда.',
					'Проп `ui` добавляет классы к частям `root`, `body`, `y-axis`, `y-tick`, `plot`, `svg`, `grid`, `shapes`, `area`, `line`,',
					'`bar`, `guide`, `marker`, `tooltip`, `tooltip-label`, `tooltip-row`, `tooltip-name`, `tooltip-value`, `swatch`, `x-axis`,',
					'`x-tick`, `legend`, `legend-item`, `empty`; глобально — `defaults.BaseChart.ui` плагина.',
					'Подсказка видна при наведении или после Tab и стрелки по области графика.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseChart'], script: `const ui = ${literal(ui)}`, omit: ['label'] }),
		},
	},
	args: { labels: MONTHS.slice(0, 6), height: 120, animation: 'none', updateAnimation: 'none' },
	render: args => ({
		components: { BaseChart },
		setup: useStorySetup(args, { data: { ui } }),
		template,
	}),
	play: async ({ canvasElement, userEvent }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-chart')]
		const style = (root: HTMLElement, part: string) => getComputedStyle(root.querySelector(`.base-chart__${part}`)!)
		const tooltipOf = async (root: HTMLElement) => {
			root.querySelector<HTMLElement>('.base-chart__plot')!.focus()
			await userEvent.keyboard('{ArrowRight}')
			await waitFor(() => expect(root.querySelector('.base-chart__tooltip')).not.toBeNull())
			const tooltip = root.querySelector<HTMLElement>('.base-chart__tooltip')!
			const box = getComputedStyle(tooltip)
			return {
				tooltip,
				padding: box.paddingInlineStart,
				paddingTop: box.paddingTop,
				color: getComputedStyle(tooltip.firstElementChild!).color,
			}
		}

		await expect(style(themed, 'x-axis').color).not.toBe(style(plain, 'x-axis').color)
		await expect(style(themed, 'grid').stroke).not.toBe(style(plain, 'grid').stroke)
		await expect(style(themed, 'legend-item').color).not.toBe(style(plain, 'legend-item').color)
		const plainTip = await tooltipOf(plain)
		const themedTip = await tooltipOf(themed)
		await expect(themedTip.color).not.toBe(plainTip.color)
		await expect(themedTip.padding).not.toBe(plainTip.padding)
		if (!isStoryBranded()) {
			await expect(plainTip.padding).toBe('10px')
			await expect(themedTip.padding).toBe('16px')
			await expect(themedTip.paddingTop).toBe('10px')
			await expect(style(themed, 'legend').columnGap).toBe('24px')
			await expect(style(plain, 'legend').columnGap).toBe('12px')
			await expect(style(themed, 'y-axis').fontSize).not.toBe(style(plain, 'y-axis').fontSize)
		}

		await expect(classed).toHaveClass('base-chart', 'story-themed-chart')
		await expect(classed.querySelector('.base-chart__legend')).toHaveClass('story-themed-legend')
		for (const tick of classed.querySelectorAll('.base-chart__x-tick')) await expect(tick).toHaveClass('story-themed-tick')
		const classedTip = await tooltipOf(classed)
		await expect(classedTip.tooltip).toHaveClass('base-chart__tooltip', 'story-themed-tooltip')
	},
}
