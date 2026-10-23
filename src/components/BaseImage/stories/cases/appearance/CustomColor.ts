import { expect } from 'storybook/test'
import type meta from '../../BaseImage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { FOG, expectImagesVisible } from '../../shared'

export const CustomColor: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Фон под изображением — `color.bg`: виден при `fit="contain"` и у прозрачных изображений (логотипы, иконки),',
					'например чтобы вписать снимок в брендовую плашку.',
				].join('\n'),
			},
		},
	},
	args: {
		src: FOG.alt,
		alt: FOG.alt,
		fit: 'contain',
		width: 200,
		height: 200,
		color: { bg: { base: '#fef3c7' } },
	},
	play: async ({ canvas, canvasElement }) => {
		await expectImagesVisible(canvasElement, 1)
		const root = canvas.getByRole('img', { name: 'Горы в тумане' }).closest('.base-image') as HTMLElement
		await expect(getComputedStyle(root).backgroundColor).toBe('rgb(254, 243, 199)')
	},
}
