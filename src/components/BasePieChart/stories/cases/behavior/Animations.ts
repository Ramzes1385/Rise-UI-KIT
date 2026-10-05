import type meta from '../../BasePieChart.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BasePieChart from '../../../ui/BasePieChart.vue'
import { expect, userEvent, waitFor } from 'storybook/test'
import BaseButton from '@components/BaseButton/ui/BaseButton.vue'
import { CANCELLED, TASKS_BY_STATUS, TASKS_NEXT_WEEK } from '../../shared'
import { literal, STORY_WAIT_TIMEOUT, storySource, useStorySetup } from '@/stories/helpers'
import { PIE_CHART_ANIMATIONS, PIE_CHART_VARIANTS } from '../../../types/BasePieChart.types'

const examples = PIE_CHART_VARIANTS.flatMap(variant => PIE_CHART_ANIMATIONS.map(animation => ({ variant, animation })))
const tasks = TASKS_BY_STATUS
const nextTasks = TASKS_NEXT_WEEK
const extra = CANCELLED
const state = { replay: 0, isNext: false, hasExtra: false }

const template = `
	<div class="story-stack">
		<div class="story-row">
			<BaseButton @click="replay++">Повторить</BaseButton>
			<BaseButton variant="outline" :aria-pressed="isNext" @click="isNext = !isNext">Новые данные</BaseButton>
			<BaseButton variant="outline" :aria-pressed="hasExtra" @click="hasExtra = !hasExtra">Добавить сегмент</BaseButton>
		</div>
		<div class="story-grid" style="--story-grid-min: 300px">
			<div v-for="example in examples" :key="example.variant + example.animation + replay" class="story-col">
				<span class="story-label">{{ example.variant }} · {{ example.animation }}</span>
				<BasePieChart
					v-bind="args"
					:variant="example.variant"
					:animation="example.animation"
					:segments="[...(isNext ? nextTasks : tasks), ...(hasExtra ? [extra] : [])]" />
			</div>
		</div>
	</div>
`

export const Animations: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Появление `animation`: `sweep` — части по очереди набегают по кругу, `grow` — круг вырастает из центра,',
					'`fade` — проявляется, `none` — сразу. «Повторить» — показать появление ещё раз.',
					'',
					'«Новые данные» и «Добавить сегмент» — обновление: части сопоставляются по `label`, длина и начало дуги',
					'перетекают, новая часть растёт из нуля, ушедшая («На проверке») сжимается и удаляется. В `none` — сразу.',
					'',
					'Длительности — токены: появление `--rise-duration-xslow` (до пресетов движения — ⁵⁄₃ от `--rise-duration-slow`),',
					'обновление `--rise-duration-slow`, подсветка `--rise-duration-fast`. При «уменьшить движение» в системе',
					"диаграмма сразу в конечном виде. Выключить во всём приложении — `createUiKitPlugin({ defaults: { BasePieChart: { animation: 'none' } } })`.",
				].join('\n'),
			},
			source: storySource({
				template,
				imports: ['BaseButton', 'BasePieChart'],
				state,
				script: [
					`const examples = ${literal(examples)}`,
					`const tasks = ${literal(tasks)}`,
					`const nextTasks = ${literal(nextTasks)}`,
					`const extra = ${literal(extra)}`,
				].join('\n'),
				omit: ['variant', 'animation', 'segments'],
			}),
		},
		controls: { include: ['size', 'sizeScale'] },
	},
	args: { size: 120 },
	render: args => ({
		components: { BaseButton, BasePieChart },
		setup: useStorySetup(args, { state, data: { examples, tasks, nextTasks, extra } }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		const charts = () => [...canvasElement.querySelectorAll('.base-pie-chart')]
		const segmentsOf = (chart: Element) => chart.querySelectorAll('.base-pie-chart__segment')
		await expect(charts()).toHaveLength(8)
		await expect(canvas.getByText('donut · sweep')).toBeInTheDocument()

		await userEvent.click(canvas.getByRole('button', { name: 'Новые данные' }))
		await expect(canvas.queryAllByText('На проверке')).toHaveLength(0)
		await waitFor(() => charts().forEach(chart => expect(segmentsOf(chart)).toHaveLength(3)), { timeout: STORY_WAIT_TIMEOUT })

		canvas.getByRole('button', { name: 'Добавить сегмент' }).focus()
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getAllByText('Отменено')).toHaveLength(8)
		await waitFor(() => charts().forEach(chart => expect(segmentsOf(chart)).toHaveLength(4)))

		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await expect(charts()).toHaveLength(8)
		await expect(canvas.getByRole('button', { name: 'Новые данные' })).toHaveAttribute('aria-pressed', 'true')
	},
}
