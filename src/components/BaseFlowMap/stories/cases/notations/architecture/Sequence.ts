import { expect } from 'storybook/test'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowNode, flowNodes } from '../../../shared'
import { flowSequence } from '@components/BaseFlowMap'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { ORDER_SEQUENCE } from '../../../fixtures/architecture/sequence'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowSequence]" />
`

export const Sequence: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Диаграмма последовательности UML 2.5 (мокап Notation-Sequence): «Оформление заказа» — участники по горизонтали, время сверху вниз, порядок сообщений — порядок связей в данных.',
					'Сообщения: синхронное, асинхронное, ответ, вызов себе. Линия жизни `Receipt` создаётся сообщением `create` (заголовок встаёт на строку создания) и заканчивается сообщением `destroy` — крестом на линии.',
					'Подпись каждого сообщения стоит над его стрелкой. Комбинированные фрагменты `opt`, `alt` и `par` охватывают диапазон сообщений (`from` и `to` — id сообщений) и несут условие в квадратных скобках.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowSequence'] }),
		},
	},
	args: { data: ORDER_SEQUENCE, height: '900px', particles: false, panels: ['toolbar', 'minimap', 'legend', 'details'] },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { flowSequence } }),
		template,
	}),
	play: async ({ canvas, canvasElement }) => {
		await expect(flowNodes(canvas)).toHaveLength(12)
		await expect(flowNode(canvas, 'Receipt')).toBeVisible()
		await expect(canvas.getByRole('graphics-symbol', { name: /создать чек/ })).toBeInTheDocument()
		await expect(canvas.getByRole('graphics-symbol', { name: /закрыть/ })).toBeInTheDocument()
		const labels = [...canvasElement.querySelectorAll('.base-flow-map__edge-label')].map(label => label.textContent?.trim())
		await expect(labels).toHaveLength(ORDER_SEQUENCE.edges.length)
		await expect(labels).toEqual(expect.arrayContaining(['POST /orders', 'CheckToken', 'applyPromo()', 'создать чек', 'закрыть']))
	},
}
