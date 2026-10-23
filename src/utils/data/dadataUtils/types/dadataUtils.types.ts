/** Виды подсказок DaData: адрес, организация или ИП, банк, ФИО, электронная почта */
export const DADATA_KINDS = ['address', 'party', 'bank', 'fio', 'email'] as const

/** Вид подсказок DaData */
export type DadataKind = (typeof DADATA_KINDS)[number]

/**
 * Подсказка DaData: `value` — текст для поля, `unrestrictedValue` — полная запись (адрес с индексом, название с формой),
 * `data` — всё, что вернул сервис (ИНН, КПП, БИК, координаты, ФИАС)
 */
export interface DadataSuggestion {
	value: string
	unrestrictedValue?: string
	data?: Record<string, unknown>
}

/** Источник подсказок: запрос и сигнал отмены — ответ устаревшего запроса отбрасывается */
export type DadataSource = (query: string, options: { signal: AbortSignal }) => Promise<DadataSuggestion[]>

/**
 * Настройки запросов к DaData. `token` — ключ API (без него — запросы на свой прокси, который сам добавляет ключ),
 * `baseUrl` — адрес API подсказок без вида (`…/suggest`), `count` — сколько подсказок вернуть, `params` — прочие поля
 * запроса (`locations`, `status`, `type`, `parts`)
 */
export interface DadataOptions {
	token?: string
	baseUrl?: string
	count?: number
	params?: Record<string, unknown>
}

/** Реквизиты из подсказки: организация — ИНН, КПП, ОГРН; банк — БИК, корреспондентский счёт, ИНН, КПП */
export interface DadataRequisites {
	inn?: string
	kpp?: string
	ogrn?: string
	bik?: string
	correspondentAccount?: string
}

/** Ответ API подсказок DaData как есть */
export interface DadataResponse {
	suggestions: { value: string; unrestricted_value?: string; data?: Record<string, unknown> }[]
}
