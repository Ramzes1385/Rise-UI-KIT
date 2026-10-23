import { flowC4 } from '@components/BaseFlowMap'
import type meta from '../../BaseFlowMap.stories'
import { flowNode, flowNodes } from '../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { SHOP_C4 } from '../../fixtures/architecture/c4'
import { expect, waitFor, within } from 'storybook/test'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" :notations="[flowC4]" :is-semantic-zoom="false" />
`

export const GroupsCollapse: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Сворачивание групп вручную: смысловой зум выключен (`isSemanticZoom: false`), группа сворачивается шевроном в заголовке или полем `isCollapsed` в данных.',
					'Свёрнутая группа показывается одним блоком: связи её содержимого с внешним миром сливаются в связи блока, внутренние связи скрыты. Состояние сворачивания — вид, а не данные: оно не попадает в историю правок и `update:data`.',
					'Здесь «Сервис заказов» свёрнут в данных; шеврон «Развернуть» показывает компоненты, «Свернуть» возвращает блок. У блока есть `tabindex`: Enter на нём входит в группу (крошки показывают путь, щелчок по крошке выходит), как двойной щелчок.',
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
		await waitFor(() =>
			expect(flowNodes(canvas).some(node => node.getAttribute('aria-label')?.startsWith('Контроллер заказов'))).toBe(false),
		)
		flowNode(canvas, 'Сервис заказов').focus()
		await expect(flowNode(canvas, 'Сервис заказов')).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(flowNode(canvas, 'Контроллер заказов')).toBeVisible())
		const crumbs = canvas.getByRole('navigation', { name: 'Уровни схемы' })
		await expect(crumbs).toHaveTextContent(/Интернет-магазин›Сервис заказов$/)
		const root = canvas.queryByRole('button', { name: 'Интернет-магазин · C4' })
		if (root) {
			await userEvent.click(root)
			await waitFor(() => expect(canvas.queryByRole('navigation', { name: 'Уровни схемы' })).toBeNull())
		} else {
			await userEvent.click(within(crumbs).getByRole('button', { name: 'Интернет-магазин' }))
			await waitFor(() => expect(crumbs).not.toHaveTextContent('Сервис заказов'))
		}
		await userEvent.click(canvas.getByRole('button', { name: 'Свернуть Сервис заказов' }))
		await waitFor(() => expect(flowNode(canvas, 'Сервис заказов')).toBeVisible())
	},
}
