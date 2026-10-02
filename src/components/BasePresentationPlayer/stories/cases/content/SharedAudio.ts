import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'
import { PRESENTATION_VOICE, sharedTrackSlides } from '../../shared'

export const SharedAudio: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Одна дорожка озвучки на всю презентацию (`audio`), начало каждого слайда — `slides[].at` в секундах (0, 3, 6).',
					'Во время показа слайды сменяются по времени дорожки; переход к слайду перематывает дорожку на его начало.',
					'Проверка: Tab до шкалы, End — последний слайд и дорожка с 6-й секунды, Home — снова первый.',
				].join('\n'),
			},
		},
	},
	args: {
		audio: PRESENTATION_VOICE,
		slides: sharedTrackSlides(),
	},
	play: async ({ canvas, canvasElement, userEvent }) => {
		const slides = canvas.getByRole('slider', { name: 'Слайды' })
		const audio = canvasElement.querySelector('audio') as HTMLAudioElement

		await tabTo(slides, userEvent)
		await userEvent.keyboard('{End}')
		await waitFor(() => expect(slides).toHaveAttribute('aria-valuetext', 'Слайд 3 из 3: Команда'))
		await waitFor(() => expect(audio.currentTime).toBe(6))
		await userEvent.keyboard('{Home}')
		await waitFor(() => expect(slides).toHaveAttribute('aria-valuetext', 'Слайд 1 из 3: Кто мы'))
		await waitFor(() => expect(audio.currentTime).toBe(0))
	},
}
