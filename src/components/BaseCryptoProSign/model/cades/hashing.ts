import { bytesToBase64, toBytes } from './plugin'
import { CADES_SIGN, HASH_CHUNK } from './constants'
import { CADES } from '@composables/crypto/useCryptoPro/core/constants'
import type { CadesCertificate } from '@composables/crypto/useCryptoPro/types/cadesplugin.types'
import type { HashOptions, CadesHashedData, CadesSignPlugin, CadesKeyCertificate } from '../../types/cadesSign.types'

export async function hashAlgorithm(certificate: CadesCertificate): Promise<number> {
	try {
		const key = await (certificate as CadesKeyCertificate).PublicKey()
		const oid = await (await key.Algorithm).Value
		return oid === CADES_SIGN.KEY_GOST_2012_512 ? CADES_SIGN.HASH_GOST_2012_512 : CADES_SIGN.HASH_GOST_2012_256
	} catch {
		return CADES_SIGN.HASH_GOST_2012_256
	}
}

async function chunkBase64(data: Blob, offset: number): Promise<string> {
	return bytesToBase64(await toBytes(data.slice(offset, offset + HASH_CHUNK)))
}

export async function hashData(plugin: CadesSignPlugin, data: string | Blob, options: HashOptions): Promise<CadesHashedData> {
	const hashed = await plugin.CreateObjectAsync('CAdESCOM.HashedData')
	await hashed.propset_Algorithm(options.algorithm)
	await hashed.propset_DataEncoding(CADES.BASE64_TO_BINARY)
	const blob = typeof data === 'string' ? new Blob([data]) : data
	const total = Math.max(blob.size, 1)
	options.onProgress?.(0)
	for (let offset = 0; offset < blob.size; offset += HASH_CHUNK) {
		await hashed.Hash(await chunkBase64(blob, offset))
		options.onProgress?.(Math.min(offset + HASH_CHUNK, blob.size) / total)
	}
	if (blob.size === 0) await hashed.Hash('')
	options.onProgress?.(1)
	return hashed
}
