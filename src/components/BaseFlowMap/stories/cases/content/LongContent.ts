import { flowNode } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/services'
import type { StoryObj } from '@storybook/vue3-vite'

const LONG_LABEL =
	'Сервис оформления и сопровождения заказов интернет-магазина, который создаёт заказ, резервирует товар на складе, запускает оплату и публикует событие для уведомлений, аналитики и бухгалтерии без потери порядка событий при пиковой нагрузке, повторных попытках и сбоях сети между дата-центрами и регионами'
const LONG_SUBTITLE = 'Go, gRPC, PostgreSQL, Kafka и очередь повторных попыток для заказов, которые не удалось оплатить с первого раза'
const LONG_EDGE = 'Синхронный вызов создания заказа с проверкой токена и лимитов'

const data = {
	...MAIN_MAP,
	groups: MAIN_MAP.groups?.map(group => (group.id === 'services' ? { ...group, label: 'Сервисы оформления заказа и оплаты' } : group)),
	nodes: MAIN_MAP.nodes.map(node => (node.id === 'orders' ? { ...node, label: LONG_LABEL, subtitle: LONG_SUBTITLE } : node)),
	edges: MAIN_MAP.edges.map(edge => (edge.id === 'e4' ? { ...edge, label: LONG_EDGE } : edge)),
}

export const LongContent: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Очень длинные подписи (у узла Orders — около 300 символов, плюс длинный подзаголовок, подпись связи и название дорожки):',
					'карточка обрезает текст многоточием и не растёт, подпись связи не наезжает на соседние, полный текст остаётся в подробностях и в имени для скринридера.',
				].join('\n'),
			},
		},
	},
	args: { data },
	play: async ({ canvas }) => {
		const orders = canvas.getByRole('graphics-object', { name: new RegExp(`^${LONG_LABEL.slice(0, 30)}`) })
		await expect(orders).toHaveAccessibleName(expect.stringContaining(LONG_LABEL))
		const label = orders.querySelector<HTMLElement>('.base-flow-map__node-label')!
		await expect(label.scrollWidth).toBeGreaterThan(label.clientWidth)
		const inventory = flowNode(canvas, 'Inventory')
		await expect(orders.getBoundingClientRect().width).toBeLessThan(inventory.getBoundingClientRect().width * 2.5)
	},
}
