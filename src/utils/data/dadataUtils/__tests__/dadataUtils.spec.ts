import { createDadataSource, dadataAddressText, dadataRequisites, requestDadata } from '../dadataUtils'

function mockFetch(suggestions: unknown[] = []) {
	const fetchMock = vi.fn(async () => ({ ok: true, json: async () => ({ suggestions }) }))
	vi.stubGlobal('fetch', fetchMock)
	return fetchMock
}

function lastCall(fetchMock: ReturnType<typeof mockFetch>): [string, RequestInit] {
	return fetchMock.mock.calls.at(-1) as unknown as [string, RequestInit]
}

describe('dadataUtils', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('createDadataSource: адрес вида, ключ, count и свои поля запроса', async () => {
		const fetchMock = mockFetch([{ value: 'ПАО СБЕРБАНК', unrestricted_value: 'ПАО СБЕРБАНК', data: { inn: '7707083893' } }])
		const signal = new AbortController().signal
		const source = createDadataSource('party', { token: 'KEY', count: 3, params: { status: ['ACTIVE'] } })

		await expect(source('сбер', { signal })).resolves.toEqual([
			{ value: 'ПАО СБЕРБАНК', unrestrictedValue: 'ПАО СБЕРБАНК', data: { inn: '7707083893' } },
		])
		const [url, init] = lastCall(fetchMock)
		expect(url).toBe('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/party')
		expect(init).toMatchObject({ method: 'POST', signal, headers: { Authorization: 'Token KEY' } })
		expect(JSON.parse(init.body as string)).toEqual({ query: 'сбер', count: 3, status: ['ACTIVE'] })
	})

	it('createDadataSource: свой прокси без ключа и count по умолчанию', async () => {
		const fetchMock = mockFetch()
		await createDadataSource('email', { baseUrl: '/api/dadata/' })('ivan@', { signal: new AbortController().signal })

		const [url, init] = lastCall(fetchMock)
		expect(url).toBe('/api/dadata/email')
		expect(init.headers).not.toHaveProperty('Authorization')
		expect(JSON.parse(init.body as string)).toEqual({ query: 'ivan@', count: 7 })
	})

	it('createDadataSource без настроек — адрес DaData', async () => {
		const fetchMock = mockFetch()
		await createDadataSource('fio')('иван', { signal: new AbortController().signal })
		expect(lastCall(fetchMock)[0]).toBe('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/fio')
	})

	it('requestDadata: ошибка ответа', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => ({ ok: false, status: 429 })),
		)
		await expect(requestDadata('/x', {}, { signal: new AbortController().signal })).rejects.toThrow('DaData: 429')
	})

	it('dadataRequisites: организация и банк, пустые поля пропускаются', () => {
		expect(dadataRequisites({ value: 'ООО', data: { inn: '7707083893', kpp: '773601001', ogrn: '1027700132195', bic: '' } })).toEqual({
			inn: '7707083893',
			kpp: '773601001',
			ogrn: '1027700132195',
		})
		expect(
			dadataRequisites({ value: 'Банк', data: { bic: '044525225', correspondent_account: '30101810400000000225', inn: 7 } }),
		).toEqual({
			bik: '044525225',
			correspondentAccount: '30101810400000000225',
		})
		expect(dadataRequisites({ value: 'нет данных' })).toEqual({})
	})

	it('dadataAddressText: адрес организации или банка', () => {
		expect(dadataAddressText({ value: 'ООО', data: { address: { value: 'г Москва' } } })).toBe('г Москва')
		expect(dadataAddressText({ value: 'ООО', data: { address: null } })).toBeUndefined()
		expect(dadataAddressText({ value: 'ООО' })).toBeUndefined()
	})
})
