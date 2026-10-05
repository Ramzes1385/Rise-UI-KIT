import '@testing-library/jest-dom/vitest'
import BaseMap from '../ui/BaseMap.vue'
import { fakeGoogle } from './fakeGoogle'
import { fakeYandex } from './fakeYandex'
import type { MockInstance } from 'vitest'
import { loadScript } from '@utils/dom/scriptUtils'
import { render, waitFor } from '@testing-library/vue'
import { forgetProviderApi, loadProviderApi } from '../model/providers/apiScript'

vi.mock('@utils/dom/scriptUtils', () => ({ loadScript: vi.fn() }))

let warnSpy: MockInstance<typeof console.warn>

const warnings = (): string[] => warnSpy.mock.calls.map(call => String(call[0]))

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

describe('BaseMap · язык API — одна загрузка скрипта на страницу', () => {
	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
	})

	afterEach(() => {
		warnSpy.mockRestore()
		delete (window as unknown as { ymaps3?: unknown }).ymaps3
		delete (window as unknown as { google?: unknown }).google
		vi.mocked(loadScript).mockReset()
		forgetProviderApi('yandex', 'KEY')
		forgetProviderApi('google', 'KEY')
	})

	it('две карты с разными языками в один тик — один скрипт, язык первой, предупреждение о второй', async () => {
		let resolveLoad: () => void = () => undefined
		vi.mocked(loadScript).mockImplementation(() => new Promise<void>(resolve => (resolveLoad = resolve)))
		const first = render(BaseMap, { props: { apiKey: 'KEY', language: 'ru_RU' } })
		const second = render(BaseMap, { props: { apiKey: 'KEY', language: 'en_US' } })
		await flush()

		expect(loadScript).toHaveBeenCalledTimes(1)
		expect(loadScript).toHaveBeenCalledWith('https://api-maps.yandex.ru/v3/?apikey=KEY&lang=ru_RU')
		expect(warnings()).toHaveLength(1)
		expect(warnings()[0]).toContain('«yandex»')
		expect(warnings()[0]).toContain('«ru_RU»')
		expect(warnings()[0]).toContain('«en_US»')

		const { maps } = fakeYandex()
		resolveLoad()
		await waitFor(() => expect(first.emitted('ready')).toHaveLength(1))
		await waitFor(() => expect(second.emitted('ready')).toHaveLength(1))
		expect(maps).toHaveLength(2)
		expect(loadScript).toHaveBeenCalledTimes(1)
	})

	it('скрипт уже загружен — карта с другим языком предупреждает один раз и не грузит скрипт заново', async () => {
		vi.mocked(loadScript).mockImplementation(async () => void fakeYandex())
		const first = render(BaseMap, { props: { apiKey: 'KEY', language: 'ru_RU' } })
		await waitFor(() => expect(first.emitted('ready')).toHaveLength(1))

		const second = render(BaseMap, { props: { apiKey: 'KEY', language: 'en_US' } })
		await waitFor(() => expect(second.emitted('ready')).toHaveLength(1))
		const third = render(BaseMap, { props: { apiKey: 'KEY', language: 'en_US' } })
		await waitFor(() => expect(third.emitted('ready')).toHaveLength(1))

		expect(loadScript).toHaveBeenCalledTimes(1)
		expect(warnings()).toHaveLength(1)
	})

	it('после ошибки загрузки следующая карта грузит скрипт заново — со своим языком, без предупреждения', async () => {
		vi.mocked(loadScript).mockRejectedValueOnce(new Error('403'))
		const failed = render(BaseMap, { props: { apiKey: 'KEY', language: 'ru_RU' } })
		await waitFor(() => expect(failed.emitted('error')).toHaveLength(1))

		vi.mocked(loadScript).mockImplementation(async () => void fakeYandex())
		const next = render(BaseMap, { props: { apiKey: 'KEY', language: 'en_US' } })
		await waitFor(() => expect(next.emitted('ready')).toHaveLength(1))

		expect(loadScript).toHaveBeenLastCalledWith('https://api-maps.yandex.ru/v3/?apikey=KEY&lang=en_US')
		expect(warnings()).toHaveLength(0)
	})

	it('Google: тот же загрузчик — одна загрузка на ключ, язык первой карты', async () => {
		let resolveLoad: () => void = () => undefined
		vi.mocked(loadScript).mockImplementation(() => new Promise<void>(resolve => (resolveLoad = resolve)))
		const first = render(BaseMap, { props: { provider: 'google', apiKey: 'KEY', mapId: 'MAP', language: 'ru' } })
		const second = render(BaseMap, { props: { provider: 'google', apiKey: 'KEY', mapId: 'MAP', language: 'en' } })
		await flush()

		expect(loadScript).toHaveBeenCalledTimes(1)
		expect(vi.mocked(loadScript).mock.calls[0][0]).toContain('language=ru')
		expect(warnings()).toHaveLength(1)
		expect(warnings()[0]).toContain('«google»')

		fakeGoogle().install()
		resolveLoad()
		await waitFor(() => expect(first.emitted('ready')).toHaveLength(1))
		await waitFor(() => expect(second.emitted('ready')).toHaveLength(1))
	})

	it('forgetProviderApi — следующая загрузка снова решает язык', async () => {
		const load = vi.fn(async (_language: string) => undefined)
		await loadProviderApi({ provider: 'yandex', apiKey: 'KEY', language: 'ru_RU', isLoaded: () => false, load })
		forgetProviderApi('yandex', 'KEY')
		await loadProviderApi({ provider: 'yandex', apiKey: 'KEY', language: 'en_US', isLoaded: () => false, load })

		expect(load).toHaveBeenNthCalledWith(1, 'ru_RU')
		expect(load).toHaveBeenNthCalledWith(2, 'en_US')
		expect(warnings()).toHaveLength(0)
	})
})
