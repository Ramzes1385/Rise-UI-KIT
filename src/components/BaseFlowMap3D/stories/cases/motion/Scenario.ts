import { waitForCanvas } from '../../shared'
import type meta from '../../BaseFlowMap3D.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { expect, waitFor, within } from 'storybook/test'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap3D v-bind="args" />
`

export const Scenario: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Сценарий — путь запроса по карте: токен бежит по связям, модель узла текущего шага играет своё действие (замок открывается, терминал принимает карту, колокольчик звонит), пройденные шаги закрашиваются, трафик показывают частицы. В 3D-виде панель сценария компактная: «Запустить», пауза, следующий шаг и полоса шагов; скорость и список шагов — в 2D-виде (там та же панель, что у BaseFlowMap).',
					'Действие шага — `step.model3d.animation` (по умолчанию — анимация модели; `null` — без анимации). Хронометраж `latency` растягивает шаги пропорционально времени ответа. При «уменьшить движение» и на паузе токен стоит на кадре, частицы не летят, а сцена в покое кадров не рисует.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: { '@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'] },
			}),
		},
	},
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitForCanvas(canvasElement)
		const player = await canvas.findByRole('group', { name: 'Сценарий' })
		await userEvent.click(within(player).getByRole('button', { name: 'Запустить' }))
		await waitFor(() => expect(within(player).getByRole('button', { name: 'Пауза' })).toBeVisible())
		await userEvent.click(within(player).getByRole('button', { name: 'Пауза' }))
		await userEvent.click(within(player).getByRole('button', { name: 'Следующий шаг' }))
		await expect(player).toHaveTextContent(/Шаг \d+ из 9/)
	},
}
