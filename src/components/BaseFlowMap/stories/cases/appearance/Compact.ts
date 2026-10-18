import { flowNode } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'

const template = `
	<div style="width: 375px; max-width: 100%">
		<BaseFlowMap v-bind="args" />
	</div>
`

export const Compact: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'compactBreakpoint', 'isDisabled'] },
		docs: {
			description: {
				story: [
					'Компактный вид при ширине области меньше `compactBreakpoint` (640 px по умолчанию), здесь — 375 px (макет FlowMobile): дорожки полосами,',
					'сервисы переносятся вторым рядом (`wrap: 3`), узлы — плитки со значком и подписью без подзаголовка, подписи связей скрыты, кнопки масштаба — 44 × 44 px,',
					'сценарий — плавающий плеер внизу, подробности узла — нижний лист, который закрывают ручка, Escape и «Закрыть».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'] }),
		},
	},
	args: { height: '640px' },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await waitFor(() => expect(canvas.getByRole('region', { name: 'Оформление заказа' })).toHaveClass('base-flow-map--compact'))
		const orders = flowNode(canvas, 'Orders')
		await expect(orders).toHaveClass('base-flow-map__node--tile')
		await expect(orders.querySelector('.base-flow-map__node-subtitle')).toBeNull()
		const zoomIn = canvas.getByRole('button', { name: 'Увеличить' })
		await expect(zoomIn.getBoundingClientRect().width).toBeGreaterThanOrEqual(40)
		await userEvent.click(orders)
		await waitFor(() => expect(document.querySelector('.base-flow-map__sheet')).not.toBeNull())
	},
}
