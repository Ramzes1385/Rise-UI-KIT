import type meta from '../../BasePieChart.stories'
import { BaseButton } from '@components/BaseButton'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePieChart from '../../../ui/BasePieChart.vue'
import { expect, userEvent, waitFor } from 'storybook/test'
import { CANCELLED, TASKS_BY_STATUS, TASKS_NEXT_WEEK } from '../../shared'
import { motionPresetsStory, STORY_WAIT_TIMEOUT } from '@/stories/helpers'

const phases = [TASKS_BY_STATUS, TASKS_NEXT_WEEK, [...TASKS_NEXT_WEEK, CANCELLED]]

const motion = motionPresetsStory({
	item: `
		<div v-for="animation in ['sweep', 'grow', 'fade', 'none']" :key="animation + Math.floor(step / 3)" class="story-col">
			<span class="story-label">{{ animation }}</span>
			<BasePieChart v-bind="args" :animation="animation" :segments="phases[step % 3]" />
		</div>
	`,
	components: { BaseButton, BasePieChart },
	imports: ['BasePieChart'],
	state: { step: 0, phases },
	action: 'step++',
	trigger: 'Следующий шаг',
	omit: ['animation', 'segments'],
})

export const Animations: StoryObj<typeof meta> = {
	name: 'Анимации',
	parameters: {
		docs: {
			description: {
				story: [
					'Появление `animation` (строки в каждой колонке) в четырёх пресетах движения `data-rise-motion` (колонки):',
					'`sweep` — части по очереди набегают по кругу, `grow` — круг вырастает из центра, `fade` — проявляется, `none` — сразу.',
					'«Следующий шаг» по кругу: новые данные (длина и начало дуг перетекают, «На проверке» сжимается и удаляется) →',
					'новая часть «Отменено» растёт из нуля → диаграммы монтируются заново и снова показывают появление. Вид — `variant` в Controls.',
					'',
					'Длительности — токены: появление `--rise-duration-xslow`, обновление `--rise-duration-slow`, подсветка части при',
					'наведении `--rise-duration-fast`; кривая — `--rise-ease-emphasized`, у `grow` — `--rise-ease-spring`.',
					'В пресете `none` и при «уменьшить движение» в системе диаграмма сразу в конечном виде. Выключить в приложении —',
					"`createUiKitPlugin({ motion: 'none' })`, `reducedMotion: 'always'` или `defaults: { BasePieChart: { animation: 'none' } }`.",
				].join('\n'),
			},
			source: motion.source,
		},
		controls: { include: ['variant', 'size', 'sizeScale'] },
	},
	args: { size: 96 },
	render: motion.render,
	play: async ({ canvas, canvasElement }) => {
		const charts = () => [...canvasElement.querySelectorAll('.base-pie-chart')]
		const segmentsOf = (chart: Element) => chart.querySelectorAll('.base-pie-chart__segment')
		const next = canvas.getByRole('button', { name: 'Следующий шаг' })
		await expect(charts()).toHaveLength(16)

		await userEvent.click(next)
		await expect(canvas.queryAllByText('На проверке')).toHaveLength(0)
		await waitFor(() => charts().forEach(chart => expect(segmentsOf(chart)).toHaveLength(3)), { timeout: STORY_WAIT_TIMEOUT })

		next.focus()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getAllByText('Отменено')).toHaveLength(16)
		await waitFor(() => charts().forEach(chart => expect(segmentsOf(chart)).toHaveLength(4)))

		await userEvent.click(next)
		await expect(canvas.getAllByText('На проверке')).toHaveLength(16)
		await expect(canvas.queryAllByText('Отменено')).toHaveLength(0)
		await waitFor(() => charts().forEach(chart => expect(segmentsOf(chart)).toHaveLength(4)))
	},
}
