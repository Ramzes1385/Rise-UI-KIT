import { flowNode } from '../../shared'
import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/services'
import { editArgs, editModels } from './editShared'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expect, screen, waitFor, within } from 'storybook/test'

const template = `
	<div style="width: 375px; max-width: 100%">
		<BaseFlowMap v-bind="args" v-model:data="data" v-model:mode="mode" />
	</div>
`

export const EditCompact: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['compactBreakpoint', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'«Правка» на 375 px (мокап FlowMobile): область уже `compactBreakpoint`, и редактор сводится к свойствам. Панели инструментов, палитры, строки состояния и клавиш правки нет — схему на телефоне не рисуют, а поправить подпись, статус или описание элемента нужно.',
					'Нажатие на узел открывает свойства в нижнем листе (BaseDrawer): вкладок и хуков нет, только поля «Имя», «Вид», «Дорожка», «Статус», «Описание». Закрытие листа снимает выделение; изменённые данные уходят в `v-model:data`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'], models: editModels }),
		},
	},
	args: { ...editArgs, data: MAIN_MAP, height: '640px' },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args, { models: editModels }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await waitFor(() => expect(canvas.getByRole('region', { name: 'Оформление заказа' })).toHaveClass('base-flow-map--compact'))
		await expect(canvas.queryByRole('toolbar', { name: 'Инструменты правки' })).toBeNull()
		await expect(canvas.queryByRole('complementary', { name: 'Палитра элементов' })).toBeNull()
		await expect(canvasElement.querySelector('.base-flow-map__edit-status')).toBeNull()
		await userEvent.click(flowNode(canvas, 'Orders'))
		const drawer = await screen.findByRole('dialog', { name: 'Свойства и хуки' })
		await expect(within(drawer).getByText('Правка схемы — на планшете и десктопе. Здесь: свойства элемента.')).toBeVisible()
		await expect(within(drawer).queryByRole('tab')).toBeNull()
		await expect(within(drawer).getByRole('textbox', { name: 'Имя' })).toHaveValue('Orders')
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
	},
}
