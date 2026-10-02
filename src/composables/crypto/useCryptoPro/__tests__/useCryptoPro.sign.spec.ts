import type { CadesSignedData } from '../types/cadesplugin.types'
import { NOW, IVANOV, SMIRNOV, SIDOROVA, cleanup, install, customPlugin } from './cryptoProFakes'
import { useCryptoPro, CryptoProError, createCryptoProEmulation, type CryptoProEmulation, type CryptoProSignData } from '..'

function decode(signature: string): string {
	return new TextDecoder().decode(Uint8Array.from(atob(signature), char => char.charCodeAt(0)))
}

function contentOf(emulation: CryptoProEmulation): unknown {
	return emulation.calls.find(call => call.member === 'propset_Content')?.args[0]
}

function withSignedData(sign: CadesSignedData['SignCades']): void {
	const base = createCryptoProEmulation({ now: NOW }).plugin
	install(
		customPlugin(base, {
			objects: {
				'CAdESCOM.CadesSignedData': async create => ({ ...(await create()), SignCades: sign }),
			},
		}),
	)
}

afterEach(cleanup)

describe('useCryptoPro — подпись', () => {
	let emulation: CryptoProEmulation

	beforeEach(() => {
		emulation = createCryptoProEmulation({ now: NOW })
		emulation.install()
	})

	it('вызовы плагина по порядку: хранилище, поиск, подписант, кодировка, содержимое, подпись, закрытие', async () => {
		const { check, sign } = useCryptoPro()
		await check()
		const start = emulation.calls.length
		await sign('Привет', { thumbprint: IVANOV })
		const calls = emulation.calls.slice(start).filter(call => call.member !== 'CreateObjectAsync')
		expect(calls).toEqual([
			{ object: 'Store', member: 'Open', args: [2, 'My', 2] },
			{ object: 'Certificates', member: 'Find', args: [0, IVANOV] },
			{ object: 'CPSigner', member: 'propset_Certificate', args: [`certificate:${IVANOV}`] },
			{ object: 'CPSigner', member: 'propset_CheckCertificate', args: [true] },
			{ object: 'CadesSignedData', member: 'propset_ContentEncoding', args: [1] },
			{ object: 'CadesSignedData', member: 'propset_Content', args: ['0J/RgNC40LLQtdGC'] },
			{ object: 'CadesSignedData', member: 'SignCades', args: ['CPSigner', 1, false] },
			{ object: 'Store', member: 'Close', args: [] },
		])
	})

	it('присоединённая подпись содержит данные; isSigning на время подписи', async () => {
		const { sign, isSigning, error } = useCryptoPro()
		const signing = sign('Привет', { thumbprint: IVANOV })
		expect(isSigning.value).toBe(true)
		const signature = await signing
		expect(isSigning.value).toBe(false)
		expect(error.value).toBeNull()
		expect(decode(signature)).toBe(`RISE-EMULATED-CADES-BES;detached=false;thumbprint=${IVANOV};content=0J/RgNC40LLQtdGC`)
	})

	it('отсоединённая подпись — без данных', async () => {
		const signature = await useCryptoPro().sign('Привет', { thumbprint: IVANOV, detached: true })
		expect(decode(signature)).toMatch(/detached=true;.*content=$/)
		expect(emulation.calls).toContainEqual({ object: 'CadesSignedData', member: 'SignCades', args: ['CPSigner', 1, true] })
	})

	const bytes = new Uint8Array([9, 1, 2, 3, 9])
	it.each<[string, CryptoProSignData]>([
		['Uint8Array', new Uint8Array([1, 2, 3])],
		['подмассив Uint8Array', bytes.subarray(1, 4)],
		['DataView со смещением', new DataView(bytes.buffer, 1, 3)],
		['ArrayBuffer', new Uint8Array([1, 2, 3]).buffer],
		['Blob', new Blob([new Uint8Array([1, 2, 3])])],
		['File', new File([new Uint8Array([1, 2, 3])], 'doc.bin')],
	])('%s — байты как есть, Base64 «AQID»', async (_, data) => {
		await useCryptoPro().sign(data, { thumbprint: IVANOV })
		expect(contentOf(emulation)).toBe('AQID')
	})

	it('большие данные кодируются кусками без потерь', async () => {
		const large = new Uint8Array(70000).map((_, index) => index % 256)
		await useCryptoPro().sign(large, { thumbprint: IVANOV })
		const content = contentOf(emulation) as string
		expect(Uint8Array.from(atob(content), char => char.charCodeAt(0))).toEqual(large)
	})

	it('задержка плагина — isSigning держится до ответа', async () => {
		createCryptoProEmulation({ now: NOW, delay: 20 }).install()
		const { sign, isSigning } = useCryptoPro()
		const signing = sign('a', { thumbprint: IVANOV })
		await new Promise(resolve => setTimeout(resolve, 5))
		expect(isSigning.value).toBe(true)
		await signing
		expect(isSigning.value).toBe(false)
	})

	it('нет сертификата с отпечатком — certificateNotFound, detail — отпечаток', async () => {
		const { sign, error } = useCryptoPro()
		await expect(sign('a', { thumbprint: 'FFFF' })).rejects.toMatchObject({ code: 'certificateNotFound', detail: 'FFFF' })
		expect(error.value?.message).toBe('Сертификат не найден')
		expect(emulation.calls[emulation.calls.length - 1]).toEqual({ object: 'Store', member: 'Close', args: [] })
	})

	it('нет закрытого ключа — noPrivateKey до вызова SignCades', async () => {
		const { sign, isSigning } = useCryptoPro()
		await expect(sign('a', { thumbprint: SMIRNOV })).rejects.toMatchObject({ code: 'noPrivateKey', detail: SMIRNOV })
		expect(emulation.calls.some(call => call.member === 'SignCades')).toBe(false)
		expect(isSigning.value).toBe(false)
	})

	it('просроченный сертификат — certificateInvalid по коду плагина', async () => {
		const failure = await useCryptoPro()
			.sign('a', { thumbprint: SIDOROVA })
			.catch((error: unknown) => error)
		expect(failure).toBeInstanceOf(CryptoProError)
		expect(failure).toMatchObject({ code: 'certificateInvalid', detail: expect.stringContaining('0x800B0101') })
	})

	it('отмена пользователем — cancelled', async () => {
		createCryptoProEmulation({ now: NOW, scenario: 'cancel' }).install()
		const { sign, error } = useCryptoPro()
		await expect(sign('a', { thumbprint: IVANOV })).rejects.toMatchObject({ code: 'cancelled', message: 'Подпись отменена' })
		expect(error.value?.code).toBe('cancelled')
	})

	it('новый вызов обнуляет прежнюю ошибку', async () => {
		const { sign, error } = useCryptoPro()
		await sign('a', { thumbprint: 'FFFF' }).catch(() => undefined)
		const signing = sign('a', { thumbprint: IVANOV })
		expect(error.value).toBeNull()
		await signing
		expect(error.value).toBeNull()
	})

	it('диагностика не ready — sign сначала проверяет плагин', async () => {
		const { check, sign, status } = useCryptoPro()
		createCryptoProEmulation({ scenario: 'noPlugin' }).install()
		await check()
		emulation.install()
		await expect(sign('a', { thumbprint: IVANOV })).resolves.toEqual(expect.any(String))
		expect(status.state).toBe('ready')
	})

	it('после удачной проверки плагин пропал — sign проверяет заново и отдаёт ошибку', async () => {
		const { check, sign, error } = useCryptoPro()
		await check()
		createCryptoProEmulation({ scenario: 'noCsp' }).install()
		await check()
		await expect(sign('a', { thumbprint: IVANOV })).rejects.toMatchObject({ code: 'noCsp' })
		expect(error.value?.code).toBe('noCsp')
	})
})

describe('useCryptoPro — ответ плагина на подпись', () => {
	it('переводы строк в подписи убираются', async () => {
		withSignedData(async () => 'QU\r\nJD\n')
		await expect(useCryptoPro().sign('a', { thumbprint: IVANOV })).resolves.toBe('QUJD')
	})

	it('прочая ошибка — unknown с текстом плагина', async () => {
		withSignedData(() => Promise.reject(new Error('Сбой')))
		await expect(useCryptoPro().sign('a', { thumbprint: IVANOV })).rejects.toMatchObject({
			code: 'unknown',
			message: 'Ошибка КриптоПро: Сбой',
			detail: 'Сбой',
		})
	})

	it('текст ошибки — от getLastError плагина', async () => {
		const base = createCryptoProEmulation({ now: NOW, scenario: 'cancel' }).plugin
		install(customPlugin(base, { getLastError: () => 'Отказано (0x800704C7)' }))
		await expect(useCryptoPro().sign('a', { thumbprint: IVANOV })).rejects.toMatchObject({
			code: 'cancelled',
			detail: 'Отказано (0x800704C7)',
		})
	})

	it('getLastError бросает — текст самой ошибки', async () => {
		const base = createCryptoProEmulation({ now: NOW, scenario: 'cancel' }).plugin
		const getLastError = (): string => {
			throw new Error('нет текста')
		}
		install(customPlugin(base, { getLastError }))
		await expect(useCryptoPro().sign('a', { thumbprint: IVANOV })).rejects.toMatchObject({
			code: 'cancelled',
			detail: 'Действие было отменено пользователем. (0x8010006E)',
		})
	})
})
