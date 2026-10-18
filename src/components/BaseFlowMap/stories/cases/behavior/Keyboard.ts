import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { flowAnnouncer, flowNode } from '../../shared'
import { storySource, tabTo, useStorySetup } from '@/stories/helpers'

const template = `
	<BaseFlowMap v-bind="args" />
`

export const Keyboard: StoryObj<typeof meta> = {
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				story: [
					'Клавиатура по WAI-ARIA Graphics Module: Tab входит в холст (на узле — один tabindex, как в roving tabindex), стрелки переходят к ближайшему узлу в этом направлении,',
					'`]` и `[` идут по связям узла (на связи — к её концам), набор букв ищет узел по подписи, Enter выбирает и открывает подробности, Escape снимает выбор.',
					'Выбор озвучивается через live-регион: «Выбрано: Orders».',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'] }),
		},
	},
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, userEvent }) => {
		await tabTo(flowNode(canvas, 'Web'), userEvent)
		await userEvent.keyboard('{ArrowDown}')
		await expect(flowNode(canvas, 'API Gateway')).toHaveFocus()
		await userEvent.keyboard('{ArrowRight}')
		await expect(flowNode(canvas, 'Auth')).toHaveFocus()
		await userEvent.keyboard('[[')
		await expect(canvas.getByRole('graphics-symbol', { name: 'Вызов «gRPC»: API Gateway → Auth' })).toHaveFocus()
		await userEvent.keyboard('[[')
		await expect(flowNode(canvas, 'API Gateway')).toHaveFocus()
		await userEvent.keyboard(']')
		await userEvent.keyboard(']')
		await userEvent.keyboard('o')
		await expect(flowNode(canvas, 'Orders')).toHaveFocus()
		await userEvent.keyboard('{Enter}')
		await expect(flowNode(canvas, 'Orders')).toHaveAttribute('aria-current', 'true')
		await expect(canvas.getByRole('region', { name: 'Подробности узла' })).toHaveTextContent('Создаёт заказ')
		await waitFor(() => expect(flowAnnouncer(canvas)).toHaveTextContent('Выбрано: Orders'))
		await userEvent.keyboard('{Escape}')
		await expect(flowNode(canvas, 'Orders')).not.toHaveAttribute('aria-current')
		await waitFor(() => expect(flowAnnouncer(canvas)).toHaveTextContent('Выбор снят'))
	},
}
