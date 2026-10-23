import { imageMapByUrl } from '../../fixtures'
import { expect, waitFor } from 'storybook/test'
import type meta from '../../BaseImageMap.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'SVG слоя не загрузился или не прошёл проверку (здесь — битая разметка): сообщение «Не удалось загрузить карту» в `role="alert"` (регион есть с монтирования пустым, текст появляется после).',
			},
		},
	},
	args: { data: imageMapByUrl('data:image/svg+xml,%3Csvg') },
	play: async ({ canvas }) => {
		await waitFor(() => expect(canvas.getByRole('alert')).toHaveTextContent('Не удалось загрузить карту'))
	},
}
