import { ref } from 'vue'
import { SLIDE_VOICES } from './shared'
import { createFetchSpeechProvider } from '@utils/media/speechProviderUtils'
import type { PresentationSpeechError, PresentationSpeechProvider, PresentationSpeechRequest } from '../types/BasePresentationPlayer.types'

export const SPEECH_SERVICE_DELAY_MS = 600

export const SPEECH_SERVICE_FAILING_SLIDE = 1

export interface SpeechProviderStubLog {
	requests: Array<{ text: string; slide: number; voice?: string }>
	aborted: number
}

let activeLog: SpeechProviderStubLog = { requests: [], aborted: 0 }

export const speechProviderStubLog = (): SpeechProviderStubLog => activeLog

function wait(ms: number, signal: AbortSignal, log: SpeechProviderStubLog): Promise<void> {
	return new Promise((resolve, reject) => {
		const timer = setTimeout(resolve, ms)
		signal.addEventListener(
			'abort',
			() => {
				clearTimeout(timer)
				log.aborted += 1
				reject(signal.reason as Error)
			},
			{ once: true },
		)
	})
}

function createSpeechProviderStub(): PresentationSpeechProvider {
	const log: SpeechProviderStubLog = { requests: [], aborted: 0 }
	activeLog = log
	return {
		async synthesize(text: string, { slide, voice, signal }: PresentationSpeechRequest): Promise<Blob> {
			log.requests.push({ text, slide, voice })
			await wait(SPEECH_SERVICE_DELAY_MS, signal, log)
			if (slide === SPEECH_SERVICE_FAILING_SLIDE) throw new Error('TTS 502')
			const response = await fetch(SLIDE_VOICES[slide % SLIDE_VOICES.length], { signal })
			return response.blob()
		},
	}
}

export const STORYBOOK_TTS_URL = '/__rise/tts'

export const SPEECHKIT_VOICES = ['filipp', 'jane', 'alena', 'ermil', 'zahar'] as const

const speechErrorText = ({ slide, error }: PresentationSpeechError): string => `Слайд ${slide + 1}: ${String(error)} — озвучка браузером`

function useSpeechErrors() {
	const errors = ref<string[]>([])
	const onSpeechError = (value: PresentationSpeechError): void => {
		errors.value = [...errors.value, speechErrorText(value)]
	}
	return { errors, onSpeechError }
}

export function speechServiceSetup() {
	return { speechProvider: createSpeechProviderStub(), ...useSpeechErrors() }
}

export function speechYandexSetup() {
	const note = 'Нужен локальный Storybook и ключ YANDEX_SPEECHKIT_API_KEY в .env.local; без них — синтез речи браузера'
	return { speechProvider: createFetchSpeechProvider({ url: STORYBOOK_TTS_URL, format: 'mp3' }), note, ...useSpeechErrors() }
}
