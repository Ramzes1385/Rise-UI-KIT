import { expect } from 'storybook/test'
import { flowIdef3 } from '@components/BaseFlowMap'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowNode, flowNodes } from '../../../shared'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { RETURN_IDEF3 } from '../../../fixtures/process/idef3'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expectDetails, isCompact, scenarioSteps, waitScenario } from '../../../scenarioShared'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowIdef3]" />
`

export const Idef3: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'IDEF3 (мокап Notation-IDEF3): схема процесса «Возврат товара» из единиц поведения (UOB) с номером и ссылкой на функцию IDEF0 в нижней строке.',
					'Перекрёстки: «исключающее ИЛИ» (X) выбирает одну ветку — «да» или «нет», «И» (&) запускает обе ветки, синхронный «И» с двойной чертой ждёт обе перед слиянием, «ИЛИ» (O) — одну или несколько. Поток объекта «акт проверки» отмечен двойной стрелкой, реляционная связь — пунктиром, ссылка GOTO ведёт на UOB 8.',
					'Симуляция «Построен по схеме» проходит по перекрёсткам по их смыслу: исключающее выбирает ветку по умолчанию, «И» делит токен и ждёт обе ветки.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowIdef3'] }),
		},
	},
	args: { data: RETURN_IDEF3, height: '680px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { flowIdef3 } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(flowNodes(canvas)).toHaveLength(14)
		await expect(flowNode(canvas, 'Проверить заявку')).toBeVisible()
		await expect(flowNode(canvas, 'UOB 8')).toBeVisible()
		await expect(flowNode(canvas, 'И: синхронное слияние')).toBeVisible()
		if (!(await isCompact(canvasElement))) {
			await expect(await waitScenario(canvas)).toHaveTextContent('Построен по схеме')
			await expect(scenarioSteps(canvas).length).toBeGreaterThan(8)
		}
		await userEvent.click(flowNode(canvas, 'Исключающее ИЛИ: заявка корректна?'))
		await expectDetails({ canvas, canvasElement, userEvent }, 'Исключающее ИЛИ')
	},
}
