import { CADES } from '../core/constants'
import { NOW, IVANOV, cleanup } from './cryptoProFakes'
import { EMULATED_ERRORS } from '../emulation/emulatedObjects'
import type { CadesPlugin, CadesWindow, CadesCertificate } from '../types/cadesplugin.types'
import { emulatedCertificates, createCryptoProEmulation, CRYPTO_PRO_EMULATION_SCENARIOS } from '..'

const target = window as CadesWindow

async function signer(plugin: CadesPlugin) {
	return plugin.CreateObjectAsync('CAdESCOM.CPSigner')
}

afterEach(cleanup)

describe('createCryptoProEmulation', () => {
	it('сценарии', () => {
		expect(CRYPTO_PRO_EMULATION_SCENARIOS).toEqual(['ready', 'noExtension', 'noPlugin', 'noCsp', 'noCertificates', 'cancel'])
	})

	it('install ставит cadesplugin, возврат удаляет его', () => {
		const emulation = createCryptoProEmulation()
		const restore = emulation.install()
		expect(target.cadesplugin).toBe(emulation.plugin)
		restore()
		expect('cadesplugin' in target).toBe(false)
	})

	it('возврат восстанавливает прежний cadesplugin', () => {
		const previous = createCryptoProEmulation().plugin
		target.cadesplugin = previous
		const restore = createCryptoProEmulation().install()
		restore()
		expect(target.cadesplugin).toBe(previous)
	})

	it('then: ready исполняется и зовёт колбэк расширения; noExtension отклоняется без колбэка', async () => {
		const callback = vi.fn()
		target.cadesplugin_extension_loaded_callback = callback
		await expect(new Promise(resolve => createCryptoProEmulation().plugin.then(resolve))).resolves.toBeUndefined()
		expect(callback).toHaveBeenCalledTimes(1)
		const rejected = new Promise((resolve, reject) =>
			createCryptoProEmulation({ scenario: 'noExtension' }).plugin.then(resolve, reject),
		)
		await expect(rejected).rejects.toThrow(EMULATED_ERRORS.noExtension)
		expect(callback).toHaveBeenCalledTimes(1)
	})

	it('getLastError — текст ошибки или строка', () => {
		const { plugin } = createCryptoProEmulation()
		expect(plugin.getLastError(new Error('текст'))).toBe('текст')
		expect(plugin.getLastError(42)).toBe('42')
	})

	it('noCsp — создаётся только About', async () => {
		const { plugin } = createCryptoProEmulation({ scenario: 'noCsp' })
		await expect(plugin.CreateObjectAsync('CAdESCOM.About')).resolves.toBeDefined()
		await expect(plugin.CreateObjectAsync('CAdESCOM.Store')).rejects.toThrow(EMULATED_ERRORS.noCsp)
	})

	it('коллекция: неверный индекс и поиск не по отпечатку', async () => {
		const { plugin } = createCryptoProEmulation({ now: NOW })
		const store = await plugin.CreateObjectAsync('CAdESCOM.Store')
		const certificates = await store.Certificates
		await expect(certificates.Item(5)).rejects.toThrow(EMULATED_ERRORS.badIndex)
		await expect((await certificates.Find(1, IVANOV)).Count).resolves.toBe(0)
		await expect((await certificates.Find(CADES.FIND_SHA1_HASH, IVANOV.toLowerCase())).Count).resolves.toBe(1)
	})

	it('журнал: чужой объект — «object», подписант — «CPSigner», простые значения как есть', async () => {
		const emulation = createCryptoProEmulation({ now: NOW })
		const own = await signer(emulation.plugin)
		await own.propset_Certificate({} as CadesCertificate)
		const signedData = await emulation.plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
		await expect(signedData.SignCades(own, CADES.CADES_BES, false)).rejects.toThrow(EMULATED_ERRORS.notFound)
		expect(emulation.calls).toContainEqual({ object: 'CPSigner', member: 'propset_Certificate', args: ['object'] })
		expect(emulation.calls).toContainEqual({ object: 'CadesSignedData', member: 'SignCades', args: ['CPSigner', 1, false] })
	})

	it('подписант чужой эмуляции — «object» и сертификат не найден', async () => {
		const emulation = createCryptoProEmulation({ now: NOW })
		const foreign = await signer(createCryptoProEmulation().plugin)
		const signedData = await emulation.plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
		await expect(signedData.SignCades(foreign, CADES.CADES_BES, true)).rejects.toThrow(EMULATED_ERRORS.notFound)
		expect(emulation.calls).toContainEqual({ object: 'CadesSignedData', member: 'SignCades', args: ['object', 1, true] })
	})

	it('подпись сертификатом без закрытого ключа — ошибка плагина noPrivateKey', async () => {
		const { plugin } = createCryptoProEmulation({ now: NOW })
		const store = await plugin.CreateObjectAsync('CAdESCOM.Store')
		const own = await signer(plugin)
		await own.propset_Certificate(await (await store.Certificates).Item(4))
		const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
		await expect(signedData.SignCades(own, CADES.CADES_BES, false)).rejects.toThrow(EMULATED_ERRORS.noPrivateKey)
	})

	it('IsValid по «сегодня» эмуляции; даты — строки ISO', async () => {
		const { plugin } = createCryptoProEmulation({ now: NOW })
		const store = await plugin.CreateObjectAsync('CAdESCOM.Store')
		const expired = await (await store.Certificates).Item(3)
		await expect((await expired.IsValid()).Result).resolves.toBe(false)
		await expect(expired.ValidToDate).resolves.toBe(new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString())
	})
})

describe('emulatedCertificates', () => {
	it('четыре сертификата относительно now: действующий, истекающий, просроченный, без ключа', () => {
		const list = emulatedCertificates(NOW)
		expect(list.map(item => item.validTo.getTime() > NOW.getTime())).toEqual([true, true, false, true])
		expect(list.map(item => item.hasPrivateKey)).toEqual([true, true, true, false])
		expect(list[0]?.thumbprint).toBe(IVANOV)
	})
})
