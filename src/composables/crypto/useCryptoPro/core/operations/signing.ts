/** Утилиты: подпись CAdES-BES через КриптоПро — данные в Base64 (`CADESCOM_BASE64_TO_BINARY`), присоединённая или отсоединённая */
import { CADES } from '../constants'
import { CryptoProError } from '../errors'
import type { CadesPlugin } from '../../types/cadesplugin.types'
import { closeStore, findCertificate, openStore } from './certificates'
import type { CryptoProSignData, CryptoProSignOptions, CryptoProCertificate } from '../../types/useCryptoPro.types'

const CHUNK = 0x8000

function bytesToBase64(bytes: Uint8Array): string {
	let binary = ''
	for (let offset = 0; offset < bytes.length; offset += CHUNK) binary += String.fromCharCode(...bytes.subarray(offset, offset + CHUNK))
	return btoa(binary)
}

async function toBytes(data: CryptoProSignData): Promise<Uint8Array> {
	if (typeof data === 'string') return new TextEncoder().encode(data)
	if (data instanceof Blob) return new Uint8Array(await data.arrayBuffer())
	if (ArrayBuffer.isView(data)) return new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
	return new Uint8Array(data)
}

/** Данные для `propset_Content` в Base64: строка — её байты UTF-8, файл и двоичные данные — как есть */
async function toBase64(data: CryptoProSignData): Promise<string> {
	return bytesToBase64(await toBytes(data))
}

function assertPrivateKey(info: CryptoProCertificate): void {
	if (!info.hasPrivateKey) throw new CryptoProError('noPrivateKey', info.thumbprint)
}

/**
 * Подписывает данные сертификатом с отпечатком `thumbprint`; результат — Base64 без переносов строк.
 * Сертификат без закрытого ключа отклоняется до вызова плагина; срок и цепочку проверяет плагин (`CheckCertificate`)
 */
export async function signData(plugin: CadesPlugin, data: CryptoProSignData, options: CryptoProSignOptions): Promise<string> {
	const content = await toBase64(data)
	const store = await openStore(plugin)
	try {
		const { certificate, info } = await findCertificate(store, options.thumbprint)
		assertPrivateKey(info)
		const signer = await plugin.CreateObjectAsync('CAdESCOM.CPSigner')
		await signer.propset_Certificate(certificate)
		await signer.propset_CheckCertificate(true)
		const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
		await signedData.propset_ContentEncoding(CADES.BASE64_TO_BINARY)
		await signedData.propset_Content(content)
		const signature = await signedData.SignCades(signer, CADES.CADES_BES, options.detached ?? false)
		return signature.replace(/\s+/g, '')
	} finally {
		await closeStore(store)
	}
}
