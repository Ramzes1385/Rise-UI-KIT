/** Настройки `createFetchSpeechProvider` — поставщика озвучки поверх `fetch` к посреднику приложения */
export interface FetchSpeechProviderOptions {
	/** Адрес посредника приложения (`/api/tts`): ключ сервиса синтеза остаётся на его сервере */
	url: string
	/** Заголовки запроса — токен сессии приложения, не ключ сервиса. `Content-Type` ставится сам, если его нет */
	headers?: Record<string, string>
	/** Формат аудио, который посредник просит у сервиса (`mp3`, `oggopus`); уходит в теле запроса полем `format` */
	format?: string
}
