import { expect } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { tabTo, useModelArg } from '@/stories/helpers'
import type meta from '../BaseNotificationCenter.stories'
import BaseNotificationCenter from '../../ui/BaseNotificationCenter.vue'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Песочница: `v-model:items` и `v-model:filter` связаны с Controls. Проверка открывает уведомление с клавиатуры и читает остальные.',
			},
		},
	},
	render: args => {
		const onItems = useModelArg('items')
		const onFilter = useModelArg('filter')
		return {
			components: { BaseNotificationCenter },
			setup: () => ({ args, onItems, onFilter }),
			template:
				'<div style="max-width: 420px"><BaseNotificationCenter v-bind="args" @update:items="onItems" @update:filter="onFilter" /></div>',
		}
	},
	play: async ({ canvas, userEvent }) => {
		await expect(canvas.getByRole('status')).toHaveTextContent('3 новых')
		const first = canvas.getByRole('button', { name: /Анна Смирнова упомянула вас.*не прочитано/ })
		await tabTo(first, userEvent)
		await userEvent.keyboard('{Enter}')
		await expect(canvas.getByRole('status')).toHaveTextContent('2 новых')
		await userEvent.click(canvas.getByRole('button', { name: 'Прочитать все' }))
		await expect(canvas.getByRole('status')).toHaveTextContent('')
		await userEvent.click(canvas.getByRole('radio', { name: 'Непрочитанные' }))
		await expect(canvas.getByText('Всё прочитано')).toBeVisible()
	},
}
