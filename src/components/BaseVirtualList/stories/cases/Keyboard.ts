import { ORDERS, ROW_STYLE } from '../shared'
import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseVirtualList.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import BaseVirtualList from '../../ui/BaseVirtualList.vue'
import { useArgsWithoutSlots, tabTo } from '@/stories/helpers'

export const Keyboard: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Клавиатура: Tab ставит фокус на список (стрелки прокручивают его), следующий Tab — на кнопку в строке.',
			},
		},
	},
	tags: ['!autodocs'],
	args: { items: ORDERS.slice(0, 500) },
	render: args => ({
		components: { BaseVirtualList },
		setup: () => ({ props: useArgsWithoutSlots(args), rowStyle: ROW_STYLE }),
		template: `
			<BaseVirtualList v-bind="props" style="max-width: 480px; border: 1px solid var(--rise-border); border-radius: 8px">
				<template #default="{ item }">
					<div :style="rowStyle">
						<span>{{ item.title }}</span>
						<button type="button">Открыть</button>
					</div>
				</template>
			</BaseVirtualList>
		`,
	}),
	play: async ({ canvas, userEvent }) => {
		const list = canvas.getByRole('list', { name: 'Заказы' })
		await tabTo(list, userEvent)
		await userEvent.tab()
		const button = canvas.getAllByRole('button', { name: 'Открыть' })[0]
		await expect(button).toHaveFocus()
		list.scrollTop = 8000
		await waitFor(() => expect(canvas.getByText('Заказ № 1200')).toBeInTheDocument())
		await expect(button).toHaveFocus()
	},
}
