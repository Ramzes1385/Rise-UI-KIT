import { expect } from 'storybook/test'
import type meta from '../BaseNotification.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { listRender, TYPE_EXAMPLES } from '../shared'
import { NOTIFICATION_TYPES } from '../../types/BaseNotification.types'

export const Types: StoryObj<typeof meta> = {
	parameters: {
		controls: { include: ['variant', 'sizeScale'] },
		docs: {
			description: {
				story: 'Четыре типа: цвет иконки и полосы прогресса. Ошибка объявляется скринридером сразу (`alert`), остальные — `status`.',
			},
			source: { code: NOTIFICATION_TYPES.map(type => `notifications.value.add({ type: '${type}', title: '…' })`).join('\n') },
		},
	},
	render: listRender(TYPE_EXAMPLES),
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('alert')).toHaveTextContent('Не удалось загрузить видео')
		await expect(canvas.getAllByRole('status')).toHaveLength(3)
	},
}
