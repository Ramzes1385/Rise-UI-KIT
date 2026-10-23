import { setup } from './LongContent.setup'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap3D.stories'
import setupSource from './LongContent.setup.ts?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap3D from '../../../ui/BaseFlowMap3D.vue'
import { flowLive, flowScene, waitForCanvas } from '../../shared'
import { scriptSource, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap3D v-bind="args" :data="data" />
`

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['quality', 'camera', 'isLayered', 'sizeScale'] },
		docs: {
			description: {
				story: [
					'Большая карта: 64 узла в 8 группах с длинными названиями («Шлюз внешних партнёрских интеграций команды «Платежи»»). Бирка узла обрезает название многоточием, полное название — в имени для скринридера и в списке; на сцене остаётся читаемый размер при любом числе узлов.',
					'Качество `auto` включает тени картой до 80 узлов, выше — пятна-тени; число вызовов отрисовки держится в бюджете (до 60 на 300 узлов), модели одного вида рисуются инстансами. От 300 узлов в консоли разработки появится предупреждение о перегрузке сцены.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: {
					'@ramzes1385/rise-ui-kit/flow3d': ['BaseFlowMap3D'],
					'@ramzes1385/rise-ui-kit': ['type FlowMapData', 'type FlowNode'],
				},
				script: scriptSource(setupSource),
			}),
		},
	},
	args: { height: '640px' },
	render: args => ({
		components: { BaseFlowMap3D },
		setup: useStorySetup(args, { setup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent, args }) => {
		await waitForCanvas(canvasElement)
		await expect(canvasElement.querySelectorAll('.base-flow-map-3d__tag')).toHaveLength(64)
		await expect(args.onFallback).not.toHaveBeenCalled()
		await tabTo(flowScene(canvas, 'Платформа интернет-магазина: 64 узла'), userEvent)
		await userEvent.keyboard('{End}')
		await waitFor(() => expect(flowLive(canvasElement)).toHaveTextContent(/команды «.+», \S+/))
	},
}
