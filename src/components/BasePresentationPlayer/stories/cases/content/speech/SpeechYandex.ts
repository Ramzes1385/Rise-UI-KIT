import { spokenSlides } from '../../../shared'
import type { StoryObj } from '@storybook/vue3-vite'
import { storySource, useStorySetup } from '@/stories/helpers'
import type meta from '../../../BasePresentationPlayer.stories'
import BasePresentationPlayer from '../../../../ui/BasePresentationPlayer.vue'
import { SPEECHKIT_VOICES, speechYandexSetup, STORYBOOK_TTS_URL } from '../../../demo/speechProviderStub'

const models = { current: 'slide' }

const template = `
	<div class="story-stack">
		<BasePresentationPlayer v-bind="args" v-model:slide="current" :speech-provider="speechProvider" @speech-error="onSpeechError" />
		<p class="story-label">{{ note }}</p>
		<p v-for="(line, index) in errors" :key="index" class="story-label">{{ line }}</p>
	</div>
`

const script = `
const speechProvider = createFetchSpeechProvider({ url: '${STORYBOOK_TTS_URL}', format: 'mp3' })

const note = 'Нужен локальный Storybook и ключ YANDEX_SPEECHKIT_API_KEY в .env.local; без них — синтез речи браузера'

const errors = ref<string[]>([])

function onSpeechError({ slide, error }: PresentationSpeechError): void {
	errors.value = [...errors.value, \`Слайд \${slide + 1}: \${String(error)} — озвучка браузером\`]
}
`

export const SpeechYandex: StoryObj<typeof meta> = {
	parameters: {
		docs: {
			description: {
				story: [
					'Живой сервис — Яндекс SpeechKit через dev-middleware Storybook `POST /__rise/tts` (тот же код, что пример',
					'посредника в документации): ключ `YANDEX_SPEECHKIT_API_KEY` читается из `.env.local` на сервере и в браузер не',
					'попадает (без префикса `STORYBOOK_`, который Storybook отдаёт клиенту). Работает только в локальном `npm run',
					'storybook`; в собранном Storybook и без ключа посредник отвечает ошибкой, и слайды озвучивает синтез браузера.',
					`Голос — \`speechVoice\` (${SPEECHKIT_VOICES.join(', ')}…), скорость — из панели плеера, а не из запроса.`,
					'Автопроверок у истории нет: она ходит в сеть.',
				].join('\n'),
			},
			source: storySource({
				template,
				imports: [],
				importsFrom: {
					'@ramzes1385/rise-ui-kit/media': ['BasePresentationPlayer', 'type PresentationSpeechError'],
					'@ramzes1385/rise-ui-kit/utils': ['createFetchSpeechProvider'],
				},
				models,
				vue: ['ref'],
				script,
			}),
		},
	},
	args: {
		title: 'Знакомство с компанией — Яндекс SpeechKit',
		slides: spokenSlides(),
		speechVoice: 'filipp',
	},
	render: args => ({
		components: { BasePresentationPlayer },
		setup: useStorySetup(args, { models, setup: speechYandexSetup }),
		template,
	}),
}
