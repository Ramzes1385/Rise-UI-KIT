import lectureVtt from '../../media/lecture.vtt?raw'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BaseAudioPlayer.stories'
import { expect, waitFor, within } from 'storybook/test'
import BaseAudioPlayer from '../../../ui/BaseAudioPlayer.vue'
import { storySource, useStorySetup } from '@/stories/helpers'
import { DEMO_TALK, DEMO_TALK_DURATION, DEMO_TALK_PEAKS } from '../../shared'

const MODELS = { isOpen: 'isTranscriptOpen' } as const
const template = `<BaseAudioPlayer v-bind="args" v-model:is-transcript-open="isOpen" />`

export const TranscriptLecture: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Лекция: расшифровка строкой WebVTT без говорящих, панель открыта сразу (`isTranscriptOpen`), вариант soft.',
					'Поиск фильтрует реплики и подсвечивает совпадения; итог («Совпадений: 2») озвучивается скринридером.',
					'«Скачать» сохраняет расшифровку текстом: `[0:15] Opus хорошо сжимает речь…`, имя файла — из `title`.',
				].join('\n'),
			},
			source: storySource({ template, imports: ['BaseAudioPlayer'], models: MODELS }),
		},
	},
	args: {
		src: DEMO_TALK,
		title: 'Лекция 3. Цифровой звук',
		hasTitle: true,
		variant: 'soft',
		peaks: DEMO_TALK_PEAKS,
		bars: 64,
		duration: DEMO_TALK_DURATION,
		transcript: lectureVtt,
		isTranscriptOpen: true,
	},
	render: args => ({ components: { BaseAudioPlayer }, setup: useStorySetup(args, { models: MODELS }), template }),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const audio = canvasElement.querySelector('audio') as HTMLAudioElement
		const list = canvas.getByRole('list', { name: 'Реплики' })
		await expect(within(list).getAllByRole('button')).toHaveLength(10)
		await userEvent.type(canvas.getByRole('textbox', { name: 'Поиск по расшифровке' }), 'opus')
		await waitFor(() => expect(canvas.getByRole('status')).toHaveTextContent('Совпадений: 2'))
		const cues = within(list).getAllByRole('button')
		await expect(cues).toHaveLength(2)
		await expect(cues[0].querySelector('mark')).toHaveTextContent('Opus')
		await userEvent.click(cues[0])
		await waitFor(() => expect(audio.currentTime).toBe(15))
		await waitFor(() => expect(cues[0]).toHaveAttribute('aria-current', 'true'))
		await userEvent.clear(canvas.getByRole('textbox', { name: 'Поиск по расшифровке' }))
		await waitFor(() => expect(within(list).getAllByRole('button')).toHaveLength(10))
	},
}
