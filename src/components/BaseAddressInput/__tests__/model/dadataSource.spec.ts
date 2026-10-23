import { createDadataAddressSource } from '../../model/address/dadataSource'

describe('createDadataAddressSource', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('POST с ключом и своими полями запроса; ответ — подсказки', async () => {
		const fetchMock = vi.fn(async () => ({
			ok: true,
			json: async () => ({ suggestions: [{ value: 'г Москва', unrestricted_value: '101000, г Москва', data: { fias_id: '1' } }] }),
		}))
		vi.stubGlobal('fetch', fetchMock)
		const signal = new AbortController().signal
		const source = createDadataAddressSource({ token: 'KEY', count: 5, locations: [{ city: 'Москва' }] })

		await expect(source('моск', { signal })).resolves.toEqual([
			{ value: 'г Москва', unrestrictedValue: '101000, г Москва', data: { fias_id: '1' } },
		])
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(url).toBe('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/address')
		expect(init).toMatchObject({ method: 'POST', signal, headers: { Authorization: 'Token KEY' } })
		expect(JSON.parse(init.body as string)).toEqual({ query: 'моск', count: 5, locations: [{ city: 'Москва' }] })
	})

	it('свой адрес сервиса и ошибка ответа', async () => {
		const fetchMock = vi.fn(async () => ({ ok: false, status: 403 }))
		vi.stubGlobal('fetch', fetchMock)
		const source = createDadataAddressSource({ token: 'KEY', url: '/api/address' })

		await expect(source('моск', { signal: new AbortController().signal })).rejects.toThrow('DaData: 403')
		expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe('/api/address')
	})
})
