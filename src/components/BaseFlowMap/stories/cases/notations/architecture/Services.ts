import { flowNode } from '../../../shared'
import { expect, within } from 'storybook/test'
import type meta from '../../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { MAIN_MAP } from '../../../fixtures/services'
import BaseFlowMap from '../../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expectDetails, isCompact } from '../../../scenarioShared'

const template = `
	<BaseFlowMap v-bind="args" />
`

export const Services: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Карта сервисов — встроенная нотация `services` (мокап Main): дорожки «Клиенты», «Периметр», «Сервисы», «Данные», виды узлов `client`, `gateway`, `service`, `external`, `cache`, `database`, `queue`.',
					'Синхронный вызов — сплошная линия, асинхронное событие — пунктир с меткой; внешняя система (банк) — пунктирная рамка, статус «Задержки» у Payments отмечен значком, а не только цветом.',
					'Справа — сценарий «Оформление заказа» и подробности выбранного узла; слева внизу — масштаб, справа внизу — мини-карта и обозначения.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'] }),
		},
	},
	args: { data: MAIN_MAP, height: '640px' },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(flowNode(canvas, 'Payments'))
		if (await isCompact(canvasElement)) {
			await expectDetails({ canvas, canvasElement, userEvent }, 'Задержки')
		} else {
			const details = await canvas.findByRole('region', { name: 'Подробности узла' })
			await expect(details).toHaveTextContent('Задержки')
			await expect(within(details).getByText('Вызывает')).toBeVisible()
			await expect(details).toHaveTextContent('Банк')
		}
		await expect(flowNode(canvas, 'Банк')).toBeVisible()
	},
}
