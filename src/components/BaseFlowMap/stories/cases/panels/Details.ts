import { flowNode } from '../../shared'
import { isCompact } from '../../scenarioShared'
import type meta from '../../BaseFlowMap.stories'
import { MAIN_MAP } from '../../fixtures/services'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseFlowMap from '../../../ui/BaseFlowMap.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { expect, screen, waitFor, within } from 'storybook/test'

const template = `
	<BaseFlowMap v-bind="args" :panels="['toolbar', 'details']" />
`

export const Details: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Подробности (мокап Main): выбор узла открывает панель справа — название, дорожка и вид, статус со значком и текстом, описание, метрики («Запросов/с», p95, «Ошибки»), «Вызывает» и «Вызывают», команда-владелец и ссылки «Логи» и «Документация».',
					'Escape закрывает подробности, фокус возвращается на узел, с которого они открыты. На узком экране подробности — нижний лист `BaseDrawer` с ручкой и закрытием жестом. Свой вид панели — слот `details`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseFlowMap'] }),
		},
	},
	args: { data: MAIN_MAP, height: '560px', particles: false },
	render: args => ({
		components: { BaseFlowMap },
		setup: useStorySetup(args),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		if (await isCompact(canvasElement)) {
			await userEvent.click(flowNode(canvas, 'Orders'))
			const sheet = within(await screen.findByRole('dialog'))
			await expect(sheet.getByText('Запросов/с')).toBeInTheDocument()
			await expect(sheet.getByRole('link', { name: 'Логи' })).toBeInTheDocument()
			await userEvent.keyboard('{Escape}')
			await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
			return
		}
		await expect(canvas.queryByRole('region', { name: 'Подробности узла' })).toBeNull()
		await userEvent.click(flowNode(canvas, 'Orders'))
		const details = within(canvas.getByRole('region', { name: 'Подробности узла' }))
		await expect(details.getByText('Orders')).toBeVisible()
		await expect(details.getByText('Работает')).toBeVisible()
		await expect(details.getByText('Запросов/с')).toBeVisible()
		await expect(details.getByText('Вызывает')).toBeVisible()
		await expect(details.getByText('Вызывают')).toBeVisible()
		await expect(details.getByRole('link', { name: 'Логи' })).toBeVisible()
		await userEvent.click(details.getByRole('button', { name: 'Закрыть подробности' }))
		await waitFor(() => expect(canvas.queryByRole('region', { name: 'Подробности узла' })).toBeNull())
		await userEvent.click(flowNode(canvas, 'Orders'))
		await expect(canvas.getByRole('region', { name: 'Подробности узла' })).toBeVisible()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('region', { name: 'Подробности узла' })).toBeNull())
		await userEvent.click(flowNode(canvas, 'Payments'))
		const payments = canvas.getByRole('region', { name: 'Подробности узла' })
		await expect(payments).toHaveTextContent('Задержки')
		within(payments).getByRole('button', { name: 'Закрыть подробности' }).focus()
		await userEvent.keyboard('{Escape}')
		await waitFor(() => expect(canvas.queryByRole('region', { name: 'Подробности узла' })).toBeNull())
		await waitFor(() => expect(flowNode(canvas, 'Payments')).toHaveFocus())
	},
}
