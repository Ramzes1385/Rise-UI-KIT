import { expect } from 'storybook/test'
import { flowIdef0 } from '@components/BaseFlowMap'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowNode, flowNodes } from '../../../shared'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { SALES_IDEF0 } from '../../../fixtures/process/idef0'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expectDetails, isCompact, scenarioPanel, scenarioStep } from '../../../scenarioShared'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowIdef0]" />
`

export const Idef0: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'IDEF0 (мокап Notation-IDEF0): функциональная модель «Продать товар» — четыре функции A1–A4 лесенкой по диагонали (раскладка `idef0-staircase`), номера функций в правом нижнем углу, «стр. 2» у подробной диаграммы.',
					'Роли стрелок ICOM определяются стороной порта: вход слева, управление сверху, выход справа, механизм снизу; граничные стрелки (I1, C1, M1, O1) стоят у краёв диаграммы по роли. Обратная связь «Отчёт о доставке» идёт из A4 в управление A1.',
					'Правила: 3–6 функций, у каждой есть управление и выход, выход не может быть источником входа. Сценарий «Построен по схеме» обходит функции по номерам: входящие стрелки, пульс функции, исходящие. Нотация подключается пропом `notations`: `[flowIdef0]`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowIdef0'] }),
		},
	},
	args: { data: SALES_IDEF0, height: '680px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { flowIdef0 } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(flowNodes(canvas)).toHaveLength(15)
		await expect(flowNode(canvas, 'Принять заказ')).toBeVisible()
		await expect(flowNode(canvas, 'Заказ клиента')).toBeVisible()
		if (!(await isCompact(canvasElement))) {
			await expect(scenarioPanel(canvas)).toHaveTextContent('Построен по схеме')
			await userEvent.click(scenarioStep(canvas, /Заказ клиента → Принять заказ/))
			await expect(scenarioStep(canvas, /Заказ клиента → Принять заказ/)).toHaveAttribute('aria-current', 'step')
		}
		await userEvent.click(flowNode(canvas, 'Доставить заказ'))
		await expectDetails({ canvas, canvasElement, userEvent }, 'Доставить заказ')
	},
}
