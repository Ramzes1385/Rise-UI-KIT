import { expect } from 'storybook/test'
import type meta from '../../BaseHeatmap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseHeatmap from '../../../ui/BaseHeatmap.vue'
import { isStoryBranded, literal, storySource, useStorySetup } from '@/stories/helpers'

const ui = { root: 'story-themed-heatmap', cell: 'story-themed-cell' }

const template = `
	<div style="display: flex; flex-direction: column; gap: 24px">
		<BaseHeatmap v-bind="args" label="По умолчанию" :weeks="26" />
		<div style="--rise-heatmap-mark-bg: var(--rise-chart-1); --rise-heatmap-cell-bg: var(--rise-bg-accented); --rise-heatmap-cell-radius: 6px; --rise-heatmap-caption-text: var(--rise-text-highlighted); --rise-heatmap-caption-font-size: var(--rise-font-size-xs); --rise-heatmap-tooltip-text: var(--rise-primary-text); --rise-heatmap-gap: 16px;">
			<BaseHeatmap v-bind="args" label="Токены на контейнере" :weeks="26" />
		</div>
		<BaseHeatmap v-bind="args" label="Классы через ui" :weeks="26" :ui="ui" />
	</div>
`

export const Theming: StoryObj<typeof meta> = {
	name: 'Токены',
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Перекраска без пропов: «по умолчанию», «токены на контейнере», «классы через ui». Токены `--rise-heatmap-*` кит',
					'только читает — задайте их на `:root`, в теме или на контейнере: `mark-bg` (цвет насыщенного дня; проп `markColor`',
					'сильнее), `cell-bg` (пустой день — от него идут промежуточные уровни), `cell-radius`, `cell-border-active` (обводка',
					'дня под курсором), `caption-text`, `caption-font-size` (месяцы и дни недели), `tooltip-text` (строка под',
					'календарём), `gap` (календарь — строка), `scroll-radius` (область прокрутки и кольцо фокуса). Проп `ui` добавляет',
					'классы к частям `root`, `scroll`, `svg`, `caption`, `cell`, `footer`, `tooltip`, `scale`, `swatch`; глобально —',
					'`defaults.BaseHeatmap.ui` плагина.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseHeatmap'], script: `const ui = ${literal(ui)}`, omit: ['label', 'weeks'] }),
		},
	},
	render: args => ({
		components: { BaseHeatmap },
		setup: useStorySetup(args, { data: { ui }, slots: ['label', 'weeks'] }),
		template,
	}),
	play: async ({ canvasElement }) => {
		const [plain, themed, classed] = [...canvasElement.querySelectorAll<HTMLElement>('.base-heatmap')]
		const cell = (root: HTMLElement, level: number) => root.querySelector<SVGElement>(`.base-heatmap__cell--${level}`)!

		await expect(getComputedStyle(cell(themed, 4)).fill).not.toBe(getComputedStyle(cell(plain, 4)).fill)
		await expect(getComputedStyle(cell(themed, 0)).fill).not.toBe(getComputedStyle(cell(plain, 0)).fill)
		if (!isStoryBranded()) {
			await expect(getComputedStyle(cell(themed, 0)).rx).toBe('6px')
			await expect(getComputedStyle(cell(plain, 0)).rx).toBe('2px')
			await expect(getComputedStyle(themed).rowGap).toBe('16px')
		}
		await expect(classed).toHaveClass('base-heatmap', 'story-themed-heatmap')
		await expect(cell(classed, 0)).toHaveClass('base-heatmap__cell', 'story-themed-cell')
	},
}
