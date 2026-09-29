import { expect } from 'storybook/test'
import type meta from '../../BaseImage.stories'
import type { StoryObj } from '@storybook/vue3-vite'
import { STORY_WAIT_TIMEOUT } from '@/stories/helpers'

export const WithError: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Изображение не загрузилось: иконка и подпись «Ошибка загрузки» на приглушённом фоне, событие `error`.',
					'Текст `alt` не теряется — его получает иконка, скринридер озвучивает, что здесь было.',
					'Свой вид ошибки — слот `error`.',
				].join('\n'),
			},
		},
	},
	args: { src: 'Битая ссылка', alt: 'Фото профиля' },
	play: async ({ canvas, args }) => {
		await expect(await canvas.findByText('Ошибка загрузки', {}, { timeout: STORY_WAIT_TIMEOUT })).toBeVisible()
		await expect(canvas.getByRole('img', { name: 'Фото профиля' })).toBeVisible()
		await expect(args.onError).toHaveBeenCalledOnce()
	},
}
