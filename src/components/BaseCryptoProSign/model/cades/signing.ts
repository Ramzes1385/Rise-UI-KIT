import { CADES_SIGN } from './constants'
import { bytesToBase64, toBytes } from './plugin'
import { hashAlgorithm, hashData } from './hashing'
import { CryptoProError } from '@composables/crypto/useCryptoPro'
import { CADES } from '@composables/crypto/useCryptoPro/core/constants'
import type { CadesSignPlugin, CadesSignSigner } from '../../types/cadesSign.types'
import type { CryptoProSignLevel, CryptoProSignRequest } from '../../types/BaseCryptoProSign.types'
import type { CadesPlugin, CadesCertificate } from '@composables/crypto/useCryptoPro/types/cadesplugin.types'
import { closeStore, findCertificate, openStore } from '@composables/crypto/useCryptoPro/core/operations/certificates'

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

async function coSignContent(plugin: CadesSignPlugin, signer: CadesSignSigner, request: CryptoProSignRequest): Promise<string> {
	const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
	if (request.detached) {
		await signedData.propset_ContentEncoding(CADES.BASE64_TO_BINARY)
		await signedData.propset_Content(bytesToBase64(await toBytes(request.data)))
	}
	await signedData.VerifyCades(request.coSignature as string, CADES_SIGN.CADES_BES, request.detached)
	return signedData.CoSignCades(signer, LEVEL_TYPES[request.level])
}

async function coSignHashed(
	plugin: CadesSignPlugin,
	context: { signer: CadesSignSigner; certificate: CadesCertificate },
	request: CryptoProSignRequest,
): Promise<string> {
	const algorithm = await hashAlgorithm(context.certificate)
	const hashed = await hashData(plugin, request.data, { algorithm, onProgress: request.onProgress })
	const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
	await signedData.VerifyHash(hashed, request.coSignature as string, CADES_SIGN.CADES_BES)
	return signedData.CoSignHash(hashed, context.signer, LEVEL_TYPES[request.level])
}

async function produce(
	plugin: CadesSignPlugin,
	context: { signer: CadesSignSigner; certificate: CadesCertificate },
	request: CryptoProSignRequest,
): Promise<string> {
	if (request.coSignature) {
		return request.isHash ? coSignHashed(plugin, context, request) : coSignContent(plugin, context.signer, request)
	}
	return request.isHash ? signHashed(plugin, context, request) : signContent(plugin, context.signer, request)
}

export async function signRequest(plugin: CadesSignPlugin, request: CryptoProSignRequest): Promise<string> {
	const base = plugin as unknown as CadesPlugin
	const store = await openStore(base)
	try {
		const { certificate, info } = await findCertificate(store, request.thumbprint)
		if (!info.hasPrivateKey) throw new CryptoProError('noPrivateKey', info.thumbprint)
		const signer = await createSigner(plugin, certificate, request)
		const signature = await produce(plugin, { signer, certificate }, request)
		return signature.replace(/\s+/g, '')
	} finally {
		await closeStore(store)
	}
}
