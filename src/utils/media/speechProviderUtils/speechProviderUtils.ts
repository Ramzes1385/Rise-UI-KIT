/** Утилиты озвучки: поставщик синтеза речи BasePresentationPlayer поверх `fetch` к посреднику приложения */

import type { FetchSpeechProviderOptions } from './types/speechProviderUtils.types'
import type {
	PresentationSpeechProvider,
	PresentationSpeechRequest,
} from '@components/BasePresentationPlayer/types/BasePresentationPlayer.types'

function requestHeaders(headers: Record<string, string> = {}): Record<string, string> {
	const hasType = Object.keys(headers).some(name => name.toLowerCase() === 'content-type')
	return hasType ? headers : { 'Content-Type': 'application/json', ...headers }
}

/**
 * Поставщик озвучки для `speechProvider` BasePresentationPlayer: `POST url` с JSON `{ text, voice, lang, format }`,
 * ответ — аудио (`response.blob()`). Посредник приложения сам ходит в сервис синтеза (SpeechKit, SaluteSpeech…) со своим
 * ключом и может кэшировать ответы по хешу текста. Ответ не `ok` → ошибка `TTS <статус>` — плеер уйдёт на синтез речи
 * браузера и сообщит `speech-error`; отмена запроса — по `signal` плеера
 */
export function createFetchSpeechProvider(options: FetchSpeechProviderOptions): PresentationSpeechProvider {
	return {
		async synthesize(text: string, request: PresentationSpeechRequest): Promise<Blob> {
			const response = await fetch(options.url, {
				method: 'POST',
				headers: requestHeaders(options.headers),
				body: JSON.stringify({ text, voice: request.voice, lang: request.lang, format: options.format }),
				signal: request.signal,
			})
			if (!response.ok) throw new Error(`TTS ${response.status}`)
			return response.blob()
		},
	}
}
