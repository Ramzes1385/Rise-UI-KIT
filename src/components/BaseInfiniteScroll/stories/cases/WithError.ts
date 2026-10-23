import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../BaseInfiniteScroll.stories'
import { storySource, useStorySetup } from '@/stories/helpers'
import BaseInfiniteScroll from '../../ui/BaseInfiniteScroll.vue'
import { FAILING_ORDERS_SCRIPT, items, PAGE, template, useOrders } from '../shared'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: { story: 'Ошибка подгрузки: текст ошибки и кнопка «Повторить».' },
			source: storySource({
				template,
				imports: ['BaseInfiniteScroll', 'type InfiniteScrollLoadEvent'],
				vue: ['ref', 'useId'],
				script: FAILING_ORDERS_SCRIPT,
			}),
		},
	},
	args: { mode: 'manual' },
	render: (args, { id }) => ({
		components: { BaseInfiniteScroll },
		setup: useStorySetup(args, { slots: ['onLoad'], data: { feedId: `feed-${id}` }, setup: () => useOrders(true) }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		await userEvent.click(canvas.getByRole('button', { name: 'Загрузить еще' }))
		await expect(await canvas.findByText('Не удалось загрузить')).toBeVisible()
		await userEvent.click(canvas.getByRole('button', { name: 'Повторить' }))
		await waitFor(() => expect(items(canvasElement)).toBe(PAGE * 2))
	},
}
