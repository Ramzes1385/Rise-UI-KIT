import { expect } from 'storybook/test'
import { flowDfd } from '@components/BaseFlowMap'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowNode, flowNodes } from '../../../shared'
import { expectDetails } from '../../../scenarioShared'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { SHOP_DFD_GANE_SARSON } from '../../../fixtures/process/dfd'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowDfd]" />
`

export const DfdGaneSarson: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'DFD в стиле Гейна — Сарсон (мокап Notation-DFD): процесс — скруглённый прямоугольник с номером в левом верхнем углу (1.0, 2.0, 3.0), хранилище — открытый прямоугольник с кодом D1–D3, внешняя сущность — прямоугольник.',
					'Правила: потоки идут только через процесс — сущность с сущностью, сущность с хранилищем и хранилище с хранилищем не соединяются; процесс без входа («чудо») и без выхода («чёрная дыра») получает предупреждение.',
					'Стиль выбирают в данных: `layout.options.style: "gane-sarson"`. Тот же набор данных в стиле Йордона — ДеМарко — в истории `DfdYourdon`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowDfd'] }),
		},
	},
	args: { data: SHOP_DFD_GANE_SARSON, height: '680px', particles: false },
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
