import podcastVtt from '../../media/podcast.vtt'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAudioPlayer.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseAudioPlayer from '../../../ui/BaseAudioPlayer.vue'
import { DEMO_TALK, DEMO_TALK_DURATION, DEMO_TALK_PEAKS } from '../../shared'
import { STORY_WAIT_TIMEOUT, storySource, tabTo, useStorySetup } from '@/stories/helpers'

const MODELS = { isOpen: 'isTranscriptOpen' } as const
const template = `<BaseAudioPlayer v-bind="args" v-model:is-transcript-open="isOpen" />`

export const Transcript: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Подкаст с расшифровкой из файла `.vtt` (`transcript` — адрес). Говорящие — теги `<v Анна>` в WebVTT.',
					'Кнопка справа открывает панель: клик по реплике — переход к ней, текущая подсвечена и прокручивается в вид;',
					'после ручной прокрутки автопрокрутка ждёт кнопки «К текущей реплике». Стрелки, Home и End — по репликам, Escape закрывает.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAudioPlayer'], models: MODELS }),
		},
	},
	args: {
		src: DEMO_TALK,
		title: 'Разговоры о звуке, выпуск 12',
		hasTitle: true,
		peaks: DEMO_TALK_PEAKS,
		bars: 64,
		duration: DEMO_TALK_DURATION,
		transcript: podcastVtt,
	},
	render: args => ({ components: { BaseAudioPlayer }, setup: useStorySetup(args, { models: MODELS }), template }),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const audio = canvasElement.querySelector('audio') as HTMLAudioElement
		const toggle = canvas.getByRole('button', { name: 'Расшифровка' })
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')
		await tabTo(toggle, userEvent)
		await userEvent.keyboard('{Enter}')
		await waitFor(() => expect(toggle).toHaveAttribute('aria-expanded', 'true'))
		const list = await canvas.findByRole('list', { name: 'Реплики' }, { timeout: STORY_WAIT_TIMEOUT })
		const cues = within(list).getAllByRole('button')
		await expect(cues).toHaveLength(6)
		await expect(cues[1]).toHaveAccessibleName(/^0:04 Борис Сегодня обсуждаем/)

		await userEvent.click(cues[2])
		await waitFor(() => expect(audio.currentTime).toBeCloseTo(8.4, 1))
		await waitFor(() => expect(cues[2]).toHaveAttribute('aria-current', 'true'))
		await userEvent.keyboard('{ArrowDown}')
		await expect(cues[3]).toHaveFocus()
		await expect(canvas.getByRole('button', { name: 'К текущей реплике' })).toBeInTheDocument()
		await userEvent.keyboard('{Escape}')
		await expect(toggle).toHaveFocus()
		await expect(toggle).toHaveAttribute('aria-expanded', 'false')
	},
}
