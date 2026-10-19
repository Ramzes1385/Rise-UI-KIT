import { expect } from 'storybook/test'
import type meta from '../BaseFlowMap.stories'
import BaseFlowMap from '../../ui/BaseFlowMap.vue'
import type { StoryObj } from '@storybook/vue3-vite'
import { flowEdge, flowNode, flowNodes } from '../shared'
import { storySource, useStorySetup } from '@/stories/helpers'

const models = { data: 'data' }

const template = `
	<BaseFlowMap v-bind="args" v-model:data="data" />
`

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: карта сервисов «Оформление заказа» ярусами «Клиенты · Периметр · Сервисы · Данные» (макет Main): поток сверху вниз,',
					'синхронные вызовы сплошной линией, события — штриховой, внешняя система «Банк» — пунктирной рамкой, статус «Задержки» у Payments.',
					'Справа вверху — легенда, справа внизу — мини-карта, внизу — плеер сценария «Оформление заказа». `v-model:data` возвращает',
					'изменённые данные в режиме «Правка». Меняйте props в панели Controls.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'], models }),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { models }),
		template,
	}),
	play: async ({ canvas, args }) => {
		await expect(canvas.getByRole('region', { name: 'Оформление заказа' })).toHaveAttribute(
			'aria-roledescription',
			'карта взаимодействий',
		)
		await expect(canvas.getByRole('graphics-document', { name: 'Схема: Оформление заказа' })).toBeVisible()
		await expect(flowNode(canvas, 'Orders')).toBeVisible()
		await expect(flowNode(canvas, 'Payments')).toHaveAccessibleName(/статус: Предупреждение/)
		await expect(flowNodes(canvas)).toHaveLength(12)
		await expect(flowEdge(canvas, 'Вызов «gRPC»: API Gateway → Orders')).toBeVisible()
		await expect(canvas.getByRole('group', { name: 'Обозначения' })).toBeVisible()
		await expect(canvas.getByRole('application', { name: 'Мини-карта' })).toBeVisible()
		await expect(canvas.getByRole('button', { name: 'Запустить' })).toBeEnabled()
		await expect(args.onReady).toHaveBeenCalledTimes(1)
	},
}
