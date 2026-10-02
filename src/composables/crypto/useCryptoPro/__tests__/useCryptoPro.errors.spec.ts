import { setLocale } from '@/locales/state'
import { toCryptoProError } from '../core/errors'
import { createCryptoProEmulation } from '../emulation'
import { CryptoProError, CRYPTO_PRO_ERROR_CODES } from '..'

afterEach(() => setLocale('ru'))

describe('CryptoProError и коды плагина', () => {
	it.each([
		['8010006E', 'cancelled'],
		['800704C7', 'cancelled'],
		['8009200B', 'noPrivateKey'],
		['80090016', 'noPrivateKey'],
		['8009000D', 'noPrivateKey'],
		['80092004', 'certificateNotFound'],
		['800B0101', 'certificateInvalid'],
		['800B010A', 'certificateInvalid'],
		['800B0109', 'certificateInvalid'],
		['800B010C', 'certificateInvalid'],
		['80092012', 'certificateInvalid'],
		['80092013', 'certificateInvalid'],
	])('0x%s → %s', (native, code) => {
		expect(toCryptoProError(new Error(`Текст плагина. (0x${native})`)).code).toBe(code)
		expect(toCryptoProError(new Error(`Текст плагина. (0x${native.toLowerCase()})`)).code).toBe(code)
	})

	it('неизвестный код или без кода — запасной код, по умолчанию unknown', () => {
		expect(toCryptoProError(new Error('Сбой (0x80070057)')).code).toBe('unknown')
		expect(toCryptoProError(new Error('Сбой без кода'), undefined, 'noCsp').code).toBe('noCsp')
	})

	it('не Error — текст через String', () => {
		const error = toCryptoProError('строка (0x8010006E)')
		expect(error).toMatchObject({ code: 'cancelled', detail: 'строка (0x8010006E)' })
	})

	it('CryptoProError возвращается как есть', () => {
		const original = new CryptoProError('noScript')
		expect(toCryptoProError(original, createCryptoProEmulation().plugin, 'unknown')).toBe(original)
	})

	it('текст — от getLastError плагина', () => {
		const plugin = { ...createCryptoProEmulation().plugin, getLastError: () => 'Плагин: (0x80092004)' }
		expect(toCryptoProError(new Error('исходная'), plugin)).toMatchObject({
			code: 'certificateNotFound',
			detail: 'Плагин: (0x80092004)',
		})
	})

	it('свойства ошибки: имя, код, detail, текст unknown с подстановкой', () => {
		const error = new CryptoProError('unknown', 'Сбой')
		expect(error).toBeInstanceOf(Error)
		expect(error).toMatchObject({ name: 'CryptoProError', code: 'unknown', detail: 'Сбой', message: 'Ошибка КриптоПро: Сбой' })
		expect(new CryptoProError('noPlugin').detail).toBe('')
	})

	it('у каждого кода — текст из словаря (ru и en)', () => {
		const ru = CRYPTO_PRO_ERROR_CODES.map(code => new CryptoProError(code, 'x').message)
		setLocale('en')
		const en = CRYPTO_PRO_ERROR_CODES.map(code => new CryptoProError(code, 'x').message)
		for (const message of [...ru, ...en]) expect(message).not.toBe('')
		expect(new Set(en).size).toBe(CRYPTO_PRO_ERROR_CODES.length)
		expect(en.some((message, index) => message === ru[index])).toBe(false)
	})

	it('смена языка — новые ошибки на английском', () => {
		setLocale('en')
		expect(new CryptoProError('cancelled').message).toBe('Signing cancelled')
		expect(new CryptoProError('noCertificates').message).toBe('There are no certificates in the personal store')
		expect(new CryptoProError('unknown', 'Failure').message).toBe('CryptoPro error: Failure')
	})
})
