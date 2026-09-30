import { expect, waitFor } from 'storybook/test'
import type meta from '../BaseAvatarCropper.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const Square: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Квадратный кадр со скруглением — для логотипов и обложек. Начальный кадр задан `crop`: увеличение ×1.67 справа.',
			},
		},
	},
	args: { shape: 'square', crop: { x: 440, y: 120, size: 300 } },
	play: async ({ canvas }) => {
		const slider = canvas.getByRole('slider', { name: 'Масштаб' })
		await waitFor(() => expect(slider).toHaveAttribute('aria-valuenow', '1.67'))
	},
}
