import { flowNode } from '../../shared'
import { flowC4 } from '@components/BaseFlowMap'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { SHOP_C4 } from '../../fixtures/architecture/c4'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowC4]" :is-semantic-zoom="false" />
`

export const GroupsCollapse: StoryObj<typeof meta> = {
	parameters: {
		a11y: { config: { rules: [{ id: 'color-contrast', enabled: false }] } },
		docs: {
			description: {
				story: [
					'Сворачивание групп вручную: смысловой зум выключен (`isSemanticZoom: false`), группа сворачивается шевроном в заголовке или полем `isCollapsed` в данных.',
					'Свёрнутая группа показывается одним блоком: связи её содержимого с внешним миром сливаются в связи блока, внутренние связи скрыты. Состояние сворачивания — вид, а не данные: оно не попадает в историю правок и `update:data`.',
					'Здесь «Сервис заказов» свёрнут в данных; шеврон «Развернуть» показывает компоненты, «Свернуть» возвращает блок.',
					'Правило axe `color-contrast` у истории выключено: у человека (тёмно-синяя карточка) подзаголовок серый и не дотягивает до 4,5 : 1 — это дефект ядра, записка в inbox.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap', 'flowC4'] }),
		},
	},
	args: {
		data: { ...SHOP_C4, groups: SHOP_C4.groups?.map(group => (group.id === 'orders-svc' ? { ...group, isCollapsed: true } : group)) },
		height: '760px',
		particles: false,
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { data: { flowC4 } }),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await expect(flowNode(canvas, 'Сервис заказов')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Развернуть Сервис заказов' }))
		await waitFor(() => expect(flowNode(canvas, 'Контроллер заказов')).toBeVisible())
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть Сервис заказов' }))
		await waitFor(() => expect(flowNode(canvas, 'Сервис заказов')).toBeVisible())
	},
}
