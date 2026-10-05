import { MONTHS } from '../../shared'
import type meta from '../../BaseChart.stories'
import { expect, waitFor } from 'storybook/test'
import BaseChart from '../../../ui/BaseChart.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type { ChartSeries } from '../../../types/BaseChart.types'
import { CHART_ANIMATIONS } from '../../../types/BaseChart.types'
import { literal, STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'

const presets = ['none', 'subtle', 'standard', 'expressive']
const animations = CHART_ANIMATIONS
const labels = MONTHS.slice(0, 6)
const first: ChartSeries[] = [
	{ name: 'Выручка', values: [120, 135, 150, 142, 168, 180] },
	{ name: 'Расходы', values: [90, 95, 110, 105, 118, 126] },
]
const next: ChartSeries[] = [
	{ name: 'Выручка', values: [210, 160, 240, 190, 260, 300] },
	{ name: 'Расходы', values: [60, 120, 80, 140, 100, 150] },
]
const STATE = { replay: 0, isNext: false, hidden: [] as string[] }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton @click="replay += 1">Повторить</BaseButton>
			<BaseButton variant="soft" @click="isNext = !isNext">Новые данные</BaseButton>
			<BaseButton variant="soft" @click="hidden = hidden.length ? [] : ['Расходы']">
				{{ hidden.length ? 'Показать ряд' : 'Скрыть ряд' }}
			</BaseButton>
		</div>
		<div class="story-grid">
			<div v-for="preset in presets" :key="preset" class="story-stack" :data-rise-motion="preset">
				<span class="story-label">{{ preset }}</span>
				<template v-for="animation in animations" :key="animation + replay">
					<span class="story-label">{{ animation }}</span>
					<BaseChart
						v-bind="args"
						:animation="animation"
						:label="animation + ', ' + preset"
						:labels="labels"
						:series="isNext ? next : first"
						:hidden-series="hidden"
						:height="120"
						:has-legend="false" />
				</template>
			</div>
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'isStacked', 'updateAnimation', 'hasGrid'] },
		docs: {
			description: {
				story: [
					'Анимации: колонки — пресеты движения `data-rise-motion` (`none`, `subtle`, `standard`, `expressive`), строки — появление `animation`.',
					'«Повторить» монтирует графики заново, «Новые данные» — твин значений и шкалы Y (`updateAnimation`), «Скрыть ряд» — ряд гаснет, стопка плавно пересчитывается. Вид — `variant` и `isStacked` в Controls.',
					"Длительность — `--rise-duration-xslow`, кривая — `--rise-ease-emphasized`, задержка между столбиками и рядами — `--rise-motion-stagger`. Выключить движение в приложении: `animation: 'none'` и `updateAnimation: 'none'` через `defaults.BaseChart`; системное «уменьшить движение» и пресет `none` выключают его сами.",
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BaseChart', 'CHART_ANIMATIONS', 'type ChartSeries'],
				state: STATE,
				types: { hidden: 'string[]' },
				script: [
					`const presets = ${literal(presets)}`,
					'const animations = CHART_ANIMATIONS',
					`const labels = ${literal(labels)}`,
					`const first: ChartSeries[] = ${literal(first)}`,
					`const next: ChartSeries[] = ${literal(next)}`,
				].join('\n'),
				omit: ['animation', 'label', 'labels', 'series', 'hiddenSeries', 'height', 'hasLegend'],
			}),
		},
	},
	args: { variant: 'bar' },
	render: args => ({
		components: { BaseButton, BaseChart },
		setup: useStorySetup(args, {
			state: STATE,
			data: { presets, animations, labels, first, next },
		}),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const settled = () => expect(canvasElement.querySelectorAll('.base-chart__y-tick--outside')).toHaveLength(0)
		await expect(canvas.getAllByRole('img')).toHaveLength(presets.length * animations.length)
		await expect(canvasElement.querySelector('[data-rise-motion="standard"] .base-chart__shapes--grow')).not.toBeNull()
		await userEvent.click(canvas.getByRole('button', { name: 'Новые данные' }))
		await waitFor(settled, { timeout: STORY_WAIT_TIMEOUT })
		await expect(canvas.getAllByRole('img')[0]).toHaveAccessibleName(/значения от 60 до 300$/)
		await userEvent.click(canvas.getByRole('button', { name: 'Скрыть ряд' }))
		await waitFor(() =>
			expect(canvasElement.querySelectorAll('.base-chart__bar--hidden, .base-chart__line--hidden').length).toBeGreaterThan(0),
		)
		await waitFor(settled, { timeout: STORY_WAIT_TIMEOUT })
		await userEvent.click(canvas.getByRole('button', { name: 'Показать ряд' }))
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await expect(canvas.getAllByRole('img')).toHaveLength(presets.length * animations.length)
	},
}
