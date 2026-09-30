import type { AddressSource, DadataAddressOptions } from '../../types/BaseAddressInput.types'

const DADATA_URL = 'https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address'

export function createDadataAddressSource(options: DadataAddressOptions): AddressSource {
	const { token, url = DADATA_URL, count = 7, ...rest } = options
	return async (query, { signal }) => {
		const response = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Token ${token}` },
			body: JSON.stringify({ query, count, ...rest }),
			signal,
		})
		if (!response.ok) throw new Error(`DaData: ${response.status}`)
		const json = (await response.json()) as {
			suggestions: { value: string; unrestricted_value: string; data: Record<string, unknown> }[]
		}
		return json.suggestions.map(item => ({ value: item.value, unrestrictedValue: item.unrestricted_value, data: item.data }))
	}
}
