import { ivan } from '../../shared'
import { expect } from 'storybook/test'
import type meta from '../../BaseAvatar.stories'
import type { StoryObj } from '@storybook/vue3-vite'

export const WithImage: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: 'Изображение из `src` заполняет аватар. `alt` описывает его для скринридеров; пустой `alt` делает изображение декоративным.',
			},
		},
	},
	args: { src: ivan.avatar, alt: ivan.name, name: ivan.name },
	play: async ({ canvas }) => {
		await expect(canvas.getByRole('img', { name: ivan.name })).toHaveAttribute('src', ivan.avatar)
	},
}
