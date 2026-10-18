import { flowNode } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseFlowMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Disabled: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Отключённая карта: `aria-disabled`, без выбора узлов, подробностей и правки; вид остаётся читаемым.' },
		},
	},
	args: { isDisabled: true },
	play: async ({ canvas, userEvent, args }) => {
		const region = canvas.getByRole('region', { name: 'Оформление заказа' })
		await expect(region).toHaveAttribute('aria-disabled', 'true')
		const orders = flowNode(canvas, 'Orders')
		await userEvent.click(orders)
		await expect(orders).not.toHaveAttribute('aria-current')
		await expect(canvas.queryByRole('region', { name: 'Подробности узла' })).toBeNull()
		await expect(args.onChange).not.toHaveBeenCalled()
	},
}
