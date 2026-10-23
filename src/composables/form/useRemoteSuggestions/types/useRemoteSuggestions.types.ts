/** Источник подсказок: запрос и сигнал отмены — ответ устаревшего запроса отбрасывается */
export type RemoteSuggestionsSource<T> = (query: string, options: { signal: AbortSignal }) => Promise<T[]>

/** Настройки загрузки подсказок: источник и пороги читаются при каждом запросе */
export interface UseRemoteSuggestionsOptions<T> {
	/** Источник подсказок */
	source: () => RemoteSuggestionsSource<T>
	/** С какой длины запроса искать (без пробелов по краям) */
	minChars: () => number
	/** Пауза после ввода перед запросом, мс */
	debounce: () => number
}
