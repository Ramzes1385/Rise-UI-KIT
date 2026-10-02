import { tabTo } from '@/stories/helpers'
import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import { SLIDE_SPEECH, spokenSlides } from '../../shared'
import type meta from '../../BasePresentationPlayer.stories'
import { installSpeechStub, SPEECH_STUB_MS, speechStubLog } from '../../speechStub'

export const Speech: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Синтез речи браузера: `slides[].speech` — текст для `speechSynthesis`, если у слайда нет `audio` и нет общей',
					'дорожки. Голос — `speechVoice` (`name` или `voiceURI`), иначе первый голос языка кита; скорость и громкость —',
					'из панели. Конец фразы — конец слайда. Голосов нет 1,5 с или нет `speechSynthesis` — слайд идёт по `duration`.',
					'Голоса и качество зависят от браузера и системы: для обучения лучше запись.',
					`В превью — эмуляция \`speechSynthesis\` (один голос ru-RU, фраза — ${SPEECH_STUB_MS / 1000} с): системных голосов`,
					'в Storybook может не быть. В приложении эмуляция не нужна.',
					'Проверка: Tab до шкалы, Space — произносится текст первого слайда, после фразы — второй слайд; Space — пауза.',
				].join('\n'),
			},
		},
	},
	args: {
		title: 'Знакомство с компанией — синтез речи',
		slides: spokenSlides(8),
	},
	beforeEach: () => installSpeechStub(),
	play: async ({ canvas, userEvent }) => {
		const slider = canvas.getByRole('slider', { name: 'Слайды' })
		await tabTo(slider, userEvent)
		await userEvent.keyboard(' ')
		await waitFor(() => expect(speechStubLog().spoken).toEqual([SLIDE_SPEECH[0]]))

		await waitFor(() => expect(slider).toHaveAttribute('aria-valuetext', 'Слайд 2 из 3: Наши ценности'), {
			timeout: SPEECH_STUB_MS * 4,
		})
		await waitFor(() => expect(speechStubLog().spoken).toEqual([SLIDE_SPEECH[0], SLIDE_SPEECH[1]]))

		await userEvent.keyboard(' ')
		await waitFor(() => expect(speechStubLog().paused).toBeGreaterThan(0))
		await expect(canvas.getByRole('button', { name: 'Воспроизвести' })).toBeInTheDocument()
	},
}
