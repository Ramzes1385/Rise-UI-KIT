import { expect } from 'storybook/test'
import { flowEpc } from '@components/BaseFlowMap'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowNode, flowNodes } from '../../../shared'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { ORDER_EPC } from '../../../fixtures/process/epc'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowEpc]" />
`

export const Epc: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'EPC (мокап Notation-EPC): событийная цепочка процессов «Обработка заказа». События (шестиугольники) и функции (скруглённые прямоугольники) чередуются; ветвление — коннекторами «И», «ИЛИ» и «исключающее ИЛИ» (XOR).',
					'Исполнители (оргединицы) стоят слева от функции, информационные объекты — справа; связь «назначение» их не входит в поток управления.',
					'Правила нотации: событие не ведёт к событию, функция — к функции без коннектора, «ИЛИ» и XOR не ставятся сразу после события. Функции дают время `latency`, по ним проходит сценарий «Построен по схеме».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowEpc'] }),
		},
	},
	args: { data: ORDER_EPC, height: '720px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { flowEpc } }),
		template,
	}),
	play: async ({ canvas }) => {
		await expect(flowNodes(canvas)).toHaveLength(19)
		await expect(flowNode(canvas, 'Проверить заказ')).toBeVisible()
		await expect(flowNode(canvas, 'Отдел продаж')).toBeVisible()
		await expect(flowNode(canvas, 'XOR: заказ корректен?')).toBeVisible()
	},
}
