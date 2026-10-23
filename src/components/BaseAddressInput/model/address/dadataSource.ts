import { requestDadata, DADATA_SUGGEST_URL } from '@utils/data/dadataUtils'
import type { AddressSource, DadataAddressOptions } from '../../types/BaseAddressInput.types'

export function createDadataAddressSource(options: DadataAddressOptions): AddressSource {
	const { token, url = `${DADATA_SUGGEST_URL}/address`, count = 7, ...rest } = options
	return (query, { signal }) => requestDadata(url, { query, count, ...rest }, { token, signal })
}
