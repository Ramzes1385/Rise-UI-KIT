/** Утилиты: запросы подсказок DaData (адрес, организация, банк, ФИО, почта) и реквизиты из ответа */
import type { DadataKind, DadataResponse, DadataOptions, DadataRequisites, DadataSource, DadataSuggestion } from './types/dadataUtils.types'

export const DADATA_SUGGEST_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest'

function requestHeaders(token: string | undefined): Record<string, string> {
	const headers: Record<string, string> = { 'Content-Type': 'application/json', Accept: 'application/json' }
	if (token) headers.Authorization = `Token ${token}`
	return headers
}

export async function requestDadata(
	url: string,
	body: Record<string, unknown>,
	init: { token?: string; signal: AbortSignal },
): Promise<DadataSuggestion[]> {
	const response = await fetch(url, {
		method: 'POST',
		headers: requestHeaders(init.token),
		body: JSON.stringify(body),
		signal: init.signal,
	})
	if (!response.ok) throw new Error(`DaData: ${response.status}`)
	const json = (await response.json()) as DadataResponse
	return json.suggestions.map(item => ({ value: item.value, unrestrictedValue: item.unrestricted_value, data: item.data }))
}

export function createDadataSource(kind: DadataKind, options: DadataOptions = {}): DadataSource {
	const { token, baseUrl = DADATA_SUGGEST_URL, count = 7, params } = options
	const url = `${baseUrl.replace(/\/+$/, '')}/${kind}`
	return (query, { signal }) => requestDadata(url, { query, count, ...params }, { token, signal })
}

function text(data: Record<string, unknown> | undefined, key: string): string | undefined {
	const value = data?.[key]
	return typeof value === 'string' && value ? value : undefined
}

function nested(data: Record<string, unknown> | undefined, key: string): Record<string, unknown> | undefined {
	const value = data?.[key]
	return value && typeof value === 'object' ? (value as Record<string, unknown>) : undefined
}

export function dadataAddressText(suggestion: DadataSuggestion): string | undefined {
	return text(nested(suggestion.data, 'address'), 'value')
}

export function dadataRequisites(suggestion: DadataSuggestion): DadataRequisites {
	const { data } = suggestion
	const entries = {
		inn: text(data, 'inn'),
		kpp: text(data, 'kpp'),
		ogrn: text(data, 'ogrn'),
		bik: text(data, 'bic'),
		correspondentAccount: text(data, 'correspondent_account'),
	}
	return Object.fromEntries(Object.entries(entries).filter(([, value]) => value !== undefined)) as DadataRequisites
}
