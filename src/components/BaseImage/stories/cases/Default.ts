import { expect } from 'storybook/test'
import type meta from '../BaseImage.stories'
import { expectImagesVisible } from '../shared'
import type { StoryObj } from '@storybook/vue3-vite'

export const Default: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Песочница: выберите изображение и меняйте props в Controls. Пока изображение грузится, виден плейсхолдер;',
					'после загрузки оно плавно проявляется и вызывается событие `load`.',
				].join('\n'),
			},
		},
	},
	play: async ({ canvas, canvasElement, args }) => {
		const image = canvas.getByRole('img', { name: 'Горы на рассвете' })
		await expectImagesVisible(canvasElement, 1)
		await expect(args.onLoad).toHaveBeenCalledOnce()
		await expect(image.closest('picture')?.querySelector('source')).toBeNull()
	},
}
