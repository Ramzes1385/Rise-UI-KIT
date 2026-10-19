import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/services'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { flowAnnouncer, flowNode } from '../../shared'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'
import { compactPlayer, compactTotal, isCompact, panelButton, scenarioPanel, scenarioStep, scenarioSteps } from '../../scenarioShared'

const template = `
	<BaseFlowMap v-bind="args" />
`

export const Scenario: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Сценарий — анимированный путь по карте (мокап Main): токен бежит по связям, пройденные шаги закрашиваются, текущий отмечен `aria-current="step"`.',
					'Панель справа: «Запустить» и «Пауза», «Запустить с начала», полоса шагов, перемотка, шаги ±1, скорость 0,5×, 1×, 2× и список шагов в виде «откуда → куда · что · как · мс». Клик по шагу перематывает на него.',
					'Хронометраж `latency` растягивает шаги пропорционально реальному времени (Payments и банк — самые долгие); итог «≈ 0,9 с от клика до письма» берётся из `summary`. Шаги озвучивает скрытый live-регион.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'] }),
		},
	},
	args: { data: MAIN_MAP, height: '640px' },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (await isCompact(canvasElement)) {
			const player = compactPlayer(canvas)
			await userEvent.click(within(player).getByRole('button', { name: 'Запустить' }))
			await waitFor(() => expect(within(player).getByRole('button', { name: 'Пауза' })).toBeVisible())
			await userEvent.click(within(player).getByRole('button', { name: 'Пауза' }))
			await expect(await compactTotal(canvas, userEvent)).toBe(9)
			await expect(flowNode(canvas, 'Payments')).toBeVisible()
			return
		}
		const panel = scenarioPanel(canvas)
		await expect(panel).toHaveAttribute('data-status', 'idle')
		await expect(panel).toHaveTextContent('Готов к запуску')
		await expect(scenarioSteps(canvas)).toHaveLength(9)
		await userEvent.click(panelButton(canvas, 'Запустить'))
		await waitFor(() => expect(panel).toHaveAttribute('data-status', 'playing'))
		await userEvent.click(panelButton(canvas, 'Пауза'))
		await expect(panel).toHaveAttribute('data-status', 'paused')
		await userEvent.click(scenarioStep(canvas, /Orders → Payments/))
		await expect(scenarioStep(canvas, /Orders → Payments/)).toHaveAttribute('aria-current', 'step')
		await expect(panel).toHaveTextContent('Шаг 5 из 9')
		await userEvent.click(panelButton(canvas, 'Предыдущий шаг'))
		await expect(panel).toHaveTextContent('Шаг 4 из 9')
		await userEvent.click(panelButton(canvas, 'Следующий шаг'))
		await userEvent.click(panelButton(canvas, 'Следующий шаг'))
		await expect(scenarioStep(canvas, /Payments → Банк/)).toHaveAttribute('aria-current', 'step')
		await userEvent.click(panelButton(canvas, 'Скорость: 1×'))
		await expect(panelButton(canvas, 'Скорость: 2×')).toHaveTextContent('2×')
		await userEvent.click(scenarioStep(canvas, /Orders → Payments/))
		await expect(flowNode(canvas, 'Payments')).toBeVisible()
		await waitFor(() => expect(flowAnnouncer(canvas)).toHaveTextContent('Шаг 5 из 9'))
	},
}
