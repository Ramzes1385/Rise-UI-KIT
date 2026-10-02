import { expect } from 'storybook/test'
import { imageMapByUrl } from '../../fixtures'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'SVG слоя не загрузился или не прошёл проверку (здесь — битая разметка): сообщение «Не удалось загрузить карту» с `role="alert"`.',
			},
		},
	},
	args: { data: imageMapByUrl('data:image/svg+xml,%3Csvg') },
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('alert')).toHaveTextContent('Не удалось загрузить карту')
	},
}
