import { tabTo } from '@/stories/helpers'
import { videoSlides } from '../../shared'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'

export const VideoSlide: StoryObj<typeof meta> = {
	name: 'Слайд с видео',
	parameters: {
		docs: {
			description: {
				story: [
					'Слайд с видео вместо картинки: `slides[].video`. Видео без озвучки играет со своим звуком, слайд заканчивается вместе с роликом;',
					'если у слайда есть `audio` или общая дорожка, видео идёт без звука и по кругу, а слайд — по озвучке. Подпись видео для',
					'скринридера — `alt` слайда (если его нет, `title`). Видеофайл — демо-ролик BaseMediaPlayer.',
					'Проверка: Tab до шкалы, → — второй слайд (видео с озвучкой), ещё → — слайд-картинка без видео.',
				].join('\n'),
			},
		},
	},
	args: { slides: videoSlides(), title: 'Ролики' },
	play: async ({ canvas, canvasElement, userEvent }) => {
		const video = () => canvasElement.querySelector('video')
		const slides = canvas.getByRole('slider', { name: 'Слайды' })
		await waitFor(() => expect(canvas.getByLabelText('Демонстрационный ролик без озвучки')).toBe(video()))
		await expect(video()).toHaveProperty('muted', false)
		await expect(video()).toHaveProperty('loop', false)

		await tabTo(slides, userEvent)
		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(canvas.getByLabelText('Демонстрационный ролик с озвучкой')).toBe(video()))
		await expect(video()).toHaveProperty('muted', true)
		await expect(video()).toHaveProperty('loop', true)

		await userEvent.keyboard('{ArrowRight}')
		await waitFor(() => expect(video()).toBeNull())
		await expect(canvas.getByRole('img', { name: 'Горы на рассвете' })).toBeInTheDocument()
	},
}
