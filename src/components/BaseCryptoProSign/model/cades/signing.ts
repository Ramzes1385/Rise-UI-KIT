import { CADES_SIGN } from './constants'
import { bytesToBase64, toBytes } from './plugin'
import { hashAlgorithm, hashData } from './hashing'
import { CryptoProError } from '@composables/crypto/useCryptoPro'
import { CADES } from '@composables/crypto/useCryptoPro/core/constants'
import type { CadesSignPlugin, CadesSignSigner } from '../../types/cadesSign.types'
import type { CryptoProSignLevel, CryptoProSignRequest } from '../../types/BaseCryptoProSign.types'
import { closeStore, findCertificate, openStore } from '@composables/crypto/useCryptoPro/core/certificates'
import type { CadesPlugin, CadesCertificate } from '@composables/crypto/useCryptoPro/types/cadesplugin.types'

const LEVEL_TYPES: Record<CryptoProSignLevel, number> = {
	bes: CADES_SIGN.CADES_BES,
	t: CADES_SIGN.CADES_T,
	xlt1: CADES_SIGN.CADES_X_LONG_TYPE_1,
}

async function createSigner(
	plugin: CadesSignPlugin,
	certificate: CadesCertificate,
	request: CryptoProSignRequest,
): Promise<CadesSignSigner> {
	const signer = await plugin.CreateObjectAsync('CAdESCOM.CPSigner')
	await signer.propset_Certificate(certificate)
	await signer.propset_CheckCertificate(true)
	if (request.level !== 'bes') await signer.propset_TSAAddress(request.tsaAddress)
	const attribute = await plugin.CreateObjectAsync('CAdESCOM.CPAttribute')
	await attribute.propset_Name(CADES_SIGN.SIGNING_TIME_ATTRIBUTE)
	await attribute.propset_Value(new Date())
	await (await signer.AuthenticatedAttributes2).Add(attribute)
	return signer
}

async function signContent(plugin: CadesSignPlugin, signer: CadesSignSigner, request: CryptoProSignRequest): Promise<string> {
	const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
	await signedData.propset_ContentEncoding(CADES.BASE64_TO_BINARY)
	await signedData.propset_Content(bytesToBase64(await toBytes(request.data)))
	return signedData.SignCades(signer, LEVEL_TYPES[request.level], request.detached)
}

async function signHashed(
	plugin: CadesSignPlugin,
	context: { signer: CadesSignSigner; certificate: CadesCertificate },
	request: CryptoProSignRequest,
): Promise<string> {
	const algorithm = await hashAlgorithm(context.certificate)
	const hashed = await hashData(plugin, request.data, { algorithm, onProgress: request.onProgress })
	const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
	return signedData.SignHash(hashed, context.signer, LEVEL_TYPES[request.level])
}

export async function signRequest(plugin: CadesSignPlugin, request: CryptoProSignRequest): Promise<string> {
	const base = plugin as unknown as CadesPlugin
	const store = await openStore(base)
	try {
		const { certificate, info } = await findCertificate(store, request.thumbprint)
		if (!info.hasPrivateKey) throw new CryptoProError('noPrivateKey', info.thumbprint)
		const signer = await createSigner(plugin, certificate, request)
		const signature = request.isHash
			? await signHashed(plugin, { signer, certificate }, request)
			: await signContent(plugin, signer, request)
		return signature.replace(/\s+/g, '')
	} finally {
		await closeStore(store)
	}
}
