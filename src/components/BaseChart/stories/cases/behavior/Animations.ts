import { MONTHS } from '../../shared'
import type meta from '../../BaseChart.stories'
import { expect, waitFor } from 'storybook/test'
import BaseChart from '../../../ui/BaseChart.vue'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import type { ChartSeries } from '../../../types/BaseChart.types'
import { CHART_ANIMATIONS } from '../../../types/BaseChart.types'
import { motionPresetsStory, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

const first: ChartSeries[] = [
	{ name: 'Выручка', values: [120, 135, 150, 142, 168, 180] },
	{ name: 'Расходы', values: [90, 95, 110, 105, 118, 126] },
]
const next: ChartSeries[] = [
	{ name: 'Выручка', values: [210, 160, 240, 190, 260, 300] },
	{ name: 'Расходы', values: [60, 120, 80, 140, 100, 150] },
]
const phases = [
	{ series: first, hidden: [] as string[] },
	{ series: next, hidden: [] as string[] },
	{ series: next, hidden: ['Расходы'] },
]

const motion = motionPresetsStory({
	item: `
		<div v-for="animation in ['grow', 'draw', 'fade', 'none']" :key="animation + Math.floor(step / 3)" class="story-col">
			<span class="story-label">{{ animation }}</span>
			<BaseChart
				v-bind="args"
				:animation="animation"
				:label="'Появление ' + animation"
				:labels="labels"
				:series="phases[step % 3].series"
				:hidden-series="phases[step % 3].hidden" />
		</div>
	`,
	components: { BaseButton, BaseChart },
	imports: ['BaseChart'],
	steps: ['новые данные', 'скрыть «Расходы»', 'монтирование заново'],
	state: { labels: MONTHS.slice(0, 6), phases },
	omit: ['animation', 'label', 'labels', 'series', 'hiddenSeries'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		controls: { include: ['variant', 'isStacked', 'updateAnimation', 'hasGrid'] },
		docs: {
			description: {
				story: [
					'Появление `animation` (строки в каждой колонке: `grow`, `draw`, `fade`, `none`) в четырёх пресетах движения `data-rise-motion` (колонки).',
					'«Следующий шаг» по шагам: новые данные — значения и шкала Y плавно переходят к новым (`updateAnimation`) →',
					'ряд «Расходы» скрыт — гаснет, стопка и шкала пересчитываются плавно → графики монтируются заново и снова показывают появление.',
					'Вид — `variant` и `isStacked` в Controls.',
					'',
					'Появление — `--rise-duration-xslow` и кривая `--rise-ease-emphasized`, задержка между столбиками и рядами — `--rise-motion-stagger`;',
					'смена набора точек — перекрёстное затухание `--rise-duration-slow`, подсказка и маркеры — `--rise-duration-fast`.',
					'В пресете `none` и при «уменьшить движение» в системе график сразу в конечном виде. Выключить в приложении —',
					"`createUiKitPlugin({ motion: 'none' })`, `reducedMotion: 'always'` или `defaults: { BaseChart: { animation: 'none', updateAnimation: 'none' } }`.",
				].join('\n'),
			},
			source: motion.source,
		},
	},
	args: { variant: 'bar', height: 120, hasLegend: false },
	render: motion.render,
	play: async ({ canvas, canvasElement, userEvent }) => {
		const count = CHART_ANIMATIONS.length * 4
		const step = canvas.getByRole('button', { name: /^(Следующий шаг|Повторить)/ })
		const settled = () => expect(canvasElement.querySelectorAll('.base-chart__y-tick--outside')).toHaveLength(0)
		await expect(canvas.getAllByRole('img')).toHaveLength(count)
		await expect(canvasElement.querySelector('[data-rise-motion="standard"] .base-chart__shapes--grow')).not.toBeNull()

		await userEvent.click(step)
		await waitFor(settled, { timeout: STORY_WAIT_TIMEOUT })
		await expect(canvas.getAllByRole('img')[0]).toHaveAccessibleName(/значения от 60 до 300$/)

		await userEvent.click(step)
		await waitFor(() => expect(canvasElement.querySelectorAll('.base-chart__bar--hidden').length).toBeGreaterThan(0))
		await waitFor(settled, { timeout: STORY_WAIT_TIMEOUT })

		await userEvent.click(step)
		await expect(canvas.getAllByRole('img')).toHaveLength(count)
		await expect(canvasElement.querySelectorAll('.base-chart__bar--hidden')).toHaveLength(0)
		await expect(canvas.getAllByRole('img')[0]).not.toHaveAccessibleName(/300$/)
	},
}
