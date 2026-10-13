import { expect } from 'storybook/test'
import { BROKEN_IMAGE_SRC } from '@/stories/helpers'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAvatarCropper.stories'

export const LoadError: StoryObj<typeof meta> = {
	parameters: {
		docs: { description: { story: 'Фото не загрузилось: сообщение в области (`role="alert"`) и событие `error`.' } },
	},
	args: { src: BROKEN_IMAGE_SRC },
	play: async ({ canvas }) => {
		await expect(await canvas.findByRole('alert')).toHaveTextContent('Не удалось загрузить фото')
	},
}
