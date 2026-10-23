import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { PARALLEL_MAP } from '../../fixtures/scenarios'
import { storySource, useStorySetup } from '@/stories/helpers'
import { compactTotal, isCompact, panelButton, scenarioPanel, scenarioStep, scenarioSteps, waitScenario } from '../../scenarioShared'

const template = `
	<BaseFlowMap v-bind="args" />
`

export const ParallelBranches: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Параллельные ветки (`type: "parallel"`) идут одновременно, как параллельный шлюз BPMN: Orders резервирует товар в Inventory, пока Payments списывает оплату и ходит в банк.',
					'Следующий шаг («сохранить заказ») ждёт самую длинную ветку; длительность параллельного блока равна самой долгой ветке. В списке обе ветки отмечены `aria-current="step"`, озвучка говорит «Параллельно: …».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'] }),
		},
	},
	args: { data: PARALLEL_MAP, height: '640px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (await isCompact(canvasElement)) {
			await waitScenario(canvas, true)
			await expect(await compactTotal(canvas, userEvent)).toBe(7)
			return
		}
		await waitScenario(canvas)
		await expect(scenarioSteps(canvas)).toHaveLength(7)
		await userEvent.click(scenarioStep(canvas, /Orders → Inventory/))
		await expect(scenarioPanel(canvas)).toHaveAttribute('data-status', 'paused')
		await expect(scenarioStep(canvas, /Orders → Inventory/)).toHaveAttribute('aria-current', 'step')
		await expect(scenarioStep(canvas, /Orders → Payments/)).toHaveAttribute('aria-current', 'step')
		await expect(scenarioStep(canvas, /Payments → Банк/)).not.toHaveAttribute('aria-current')
		await userEvent.click(panelButton(canvas, 'Следующий шаг'))
		await expect(scenarioStep(canvas, /Orders → Inventory/)).not.toHaveAttribute('aria-current')
	},
}
