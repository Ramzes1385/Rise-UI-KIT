import { expect, waitFor } from 'storybook/test'
import type { StoryObj } from '@storybook/vue3-vite'
import type meta from '../../BasePresentationPlayer.stories'
import { installSpeechStub, speechStubLog } from '../../speechStub'
import { SLIDE_SPEECH, SLIDE_VOICES, spokenSlides } from '../../shared'
import BasePresentationPlayer from '../../../ui/BasePresentationPlayer.vue'
import { literal, storySource, tabTo, useStorySetup } from '@/stories/helpers'
import { SPEECH_SERVICE_DELAY_MS, SPEECH_SERVICE_FAILING_SLIDE, speechProviderStubLog, speechServiceSetup } from '../../speechProviderStub'

const models = { current: 'slide' }

const template = `
	<div class="story-stack">
		<BasePresentationPlayer v-bind="args" v-model:slide="current" :speech-provider="speechProvider" @speech-error="onSpeechError" />
		<p v-for="(line, index) in errors" :key="index" class="story-label">{{ line }}</p>
	</div>
`

const script = `
const VOICES = ${literal(SLIDE_VOICES)}

const speechProvider: PresentationSpeechProvider = {
	async synthesize(text, { slide, signal }) {
		await new Promise((resolve, reject) => {
			setTimeout(resolve, ${SPEECH_SERVICE_DELAY_MS})
			signal.addEventListener('abort', () => reject(signal.reason), { once: true })
		})
		if (slide === ${SPEECH_SERVICE_FAILING_SLIDE}) throw new Error('TTS 502')
		const response = await fetch(VOICES[slide % VOICES.length], { signal })
		return response.blob()
	},
}

const errors = ref<string[]>([])

function onSpeechError({ slide, error }: PresentationSpeechError): void {
	errors.value = [...errors.value, \`Слайд \${slide + 1}: \${String(error)} — озвучка браузером\`]
}
`

export const SpeechService: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Озвучка `slides[].speech` сервисом синтеза: проп `speechProvider` — объект с `synthesize(text, { voice, lang, slide,',
					'signal })`, который возвращает аудио (Blob или адрес). Полученная озвучка играет как запись слайда: перемотка,',
					'скорость, громкость, лоадер «Загрузка». Плеер кэширует восемь последних фраз, грузит текущий и следующий слайд',
					'заранее, отменяет лишние запросы при смене слайда и ждёт ответ не дольше 15 с; отклонение, таймаут или ошибка',
					'воспроизведения — событие `speech-error` и откат слайда на синтез речи браузера.',
					"В приложении — `createFetchSpeechProvider({ url: '/api/tts' })` из `@ramzes1385/rise-ui-kit/utils`: `POST` JSON",
					'`{ text, voice, lang, format }` к своему посреднику, а ключ сервиса (SpeechKit, SaluteSpeech) остаётся на сервере.',
					`В превью — заглушка сервиса: отдаёт локальные записи через ${SPEECH_SERVICE_DELAY_MS} мс, а для второго слайда`,
					'отвечает ошибкой `TTS 502` — он озвучивается эмуляцией `speechSynthesis`, ошибка показана под плеером.',
					'Проверка: Tab до шкалы, Space — лоадер, затем озвучка первого слайда; второй слайд — ошибка и синтез браузера;',
					'третий — снова сервис. Home — возврат к первому слайду без нового запроса (кэш).',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: {
					'@ramzes1385/rise-ui-kit/media': [
						'BasePresentationPlayer',
						'type PresentationSpeechError',
						'type PresentationSpeechProvider',
					],
				},
				models,
				vue: ['ref'],
				script,
			}),
		},
	},
	args: {
		title: 'Знакомство с компанией — озвучка сервисом',
		slides: spokenSlides(),
		speechVoice: 'filipp',
	},
	beforeEach: () => installSpeechStub(),
	render: args => ({
		components: { BasePresentationPlayer },
		setup: useStorySetup(args, { models, setup: speechServiceSetup }),
		template,
	}),
	play: async ({ canvas, canvasElement, userEvent }) => {
		const slider = canvas.getByRole('slider', { name: 'Слайды' })
		const audio = canvasElement.querySelector('audio') as HTMLAudioElement
		const requested = (): number[] => speechProviderStubLog().requests.map(request => request.slide)
		await waitFor(() => expect(requested()).toEqual([0]))
		expect(speechProviderStubLog().requests[0]).toMatchObject({ text: SLIDE_SPEECH[0], voice: 'filipp' })

		await tabTo(slider, userEvent)
		await userEvent.keyboard(' ')
		await waitFor(() => expect(requested()).toEqual([0, 1]))
		await waitFor(() => expect(audio.src).toMatch(/^blob:/), { timeout: SPEECH_SERVICE_DELAY_MS * 4 })

		await waitFor(() => expect(slider).toHaveAttribute('aria-valuetext', 'Слайд 2 из 3: Наши ценности'), { timeout: 8000 })
		await waitFor(() => expect(canvas.getByText(/Слайд 2: Error: TTS 502/)).toBeVisible(), { timeout: SPEECH_SERVICE_DELAY_MS * 4 })
		await waitFor(() => expect(speechStubLog().spoken).toEqual([SLIDE_SPEECH[1]]))
		await waitFor(() => expect(requested()).toEqual([0, 1, 2]))

		await userEvent.keyboard('{Home}')
		await waitFor(() => expect(slider).toHaveAttribute('aria-valuetext', 'Слайд 1 из 3: Кто мы'))
		await waitFor(() => expect(audio.src).toMatch(/^blob:/))
		expect(requested().filter(slide => slide === 0)).toHaveLength(1)

		await userEvent.keyboard(' ')
		await expect(canvas.getByRole('button', { name: 'Воспроизвести' })).toBeInTheDocument()
	},
}
