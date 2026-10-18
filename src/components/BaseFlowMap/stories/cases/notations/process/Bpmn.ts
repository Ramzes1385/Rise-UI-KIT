import { expect } from 'storybook/test'
import { flowBpmn } from '@components/BaseFlowMap'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowNode, flowNodes } from '../../../shared'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { RETURN_PROCESS } from '../../../fixtures/process/bpmn'
import { isCompact, scenarioPanel, scenarioStep, scenarioSteps } from '../../../scenarioShared'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowBpmn]" />
`

export const Bpmn: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'BPMN 2.0 (мокап FlowProcess): процесс «Возврат товара» с двумя пулами — «Клиент» отдельно и «Интернет-магазин» с дорожками «Поддержка», «Склад», «Бухгалтерия».',
					'Между пулами идут не потоки управления, а потоки сообщений (пунктир с кружком в начале и пустой стрелкой): правила нотации запрещают сплошной поток через границу пула.',
					'Знаки: старт, промежуточные события (сообщение, таймер), конец; задачи пользовательская, ручная, отправка, приём, служебная; шлюзы исключающий (X) и параллельный (+); у выходов исключающего шлюза — условия «да» и «нет».',
					'Справа — экземпляр процесса № 1042 с реальным временем шагов (от 2 минут до 2 суток). Нотация подключается пропом `notations`: `[flowBpmn]`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowBpmn'] }),
		},
	},
	args: { data: RETURN_PROCESS, height: '680px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { flowBpmn } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(flowNodes(canvas)).toHaveLength(17)
		if (!(await isCompact(canvasElement))) await expect(scenarioSteps(canvas)).toHaveLength(15)
		await expect(canvas.getByText('Клиент')).toBeVisible()
		await expect(canvas.getByText('Интернет-магазин')).toBeVisible()
		await expect(flowNode(canvas, 'Заявка корректна?')).toBeVisible()
		await expect(canvas.getByRole('graphics-symbol', { name: /Поток сообщений.*Отправить товар → Принять посылку/ })).toBeVisible()
		if (await isCompact(canvasElement)) return
		await userEvent.click(scenarioStep(canvas, /Принять посылку → Разветвление/))
		await expect(scenarioStep(canvas, /Принять посылку → Разветвление/)).toHaveAttribute('aria-current', 'step')
		await expect(scenarioPanel(canvas)).toHaveTextContent('Шаг 9 из 15')
	},
}
