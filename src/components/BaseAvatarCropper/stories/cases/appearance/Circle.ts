import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarCropper.stories'

export const Circle: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Круглый кадр (`shape="circle"`) — форма не по умолчанию: по умолчанию кадр — скруглённый квадрат. Начальный кадр задан `crop`: увеличение ×1.67 справа.',
			},
		},
	},
	args: { shape: 'circle', crop: { x: 440, y: 120, size: 300 } },
	play: async ({ canvas }) => {
		const slider = canvas.getByRole('slider', { name: 'Масштаб' })
		await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '1.67'))
	},
}
