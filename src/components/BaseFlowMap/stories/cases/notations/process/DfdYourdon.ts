import { expect } from 'storybook/test'
import { flowDfd } from '@components/BaseFlowMap'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowNode, flowNodes } from '../../../shared'
import { expectDetails } from '../../../scenarioShared'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { SHOP_DFD_YOURDON } from '../../../fixtures/process/dfd'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowDfd]" />
`

export const DfdYourdon: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'DFD в стиле Йордона — ДеМарко: процесс — круг с названием и номером внизу, хранилище — две параллельные линии, внешняя сущность — прямоугольник. Те же данные и правила, что в `DfdGaneSarson`, меняется только форма фигур.',
					'Стиль выбирают в данных: `layout.options.style: "yourdon-demarco"`; нотация объявляет оба стиля (`styles`), поэтому приложение подставляет форму фигур без смены данных.',
					'Потоки подписаны данными («Счёт на оплату», «Накладная»), в обе стороны между процессом и сущностью идут два отдельных потока: запрос и ответ.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowDfd'] }),
		},
	},
	args: { data: SHOP_DFD_YOURDON, height: '680px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { flowDfd } }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await expect(flowNodes(canvas)).toHaveLength(9)
		await expect(flowNode(canvas, 'Оформить заказ')).toBeVisible()
		await expect(flowNode(canvas, 'Заказы')).toBeVisible()
		await expect(flowNode(canvas, 'Клиент')).toBeVisible()
		await userEvent.click(flowNode(canvas, 'Принять оплату'))
		await expectDetails({ canvas, canvasElement, userEvent }, 'Принять оплату')
	},
}
