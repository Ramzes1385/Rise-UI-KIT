import { hashData } from './hashing'
import { CADES_SIGN } from './constants'
import { bytesToBase64, toBytes } from './plugin'
import { CADES } from '@composables/crypto/useCryptoPro/core/constants'
import { ownerName, parseSubject } from '@composables/crypto/useCryptoPro/core/subject'
import type { CryptoProVerifySigner, CryptoProVerifyRequest } from '../../types/BaseCryptoProSign.types'
import type { CadesSignPlugin, CadesSignSigner, CadesSignSignedData } from '../../types/cadesSign.types'

async function optionalDate(value: Promise<Date | string>): Promise<Date | null> {
	try {
		const date = await value
		return date instanceof Date ? date : new Date(date)
	} catch {
		return null
	}
}

async function isTrue(value: () => Promise<boolean>): Promise<boolean> {
	try {
		return await value()
	} catch {
		return false
	}
}

async function readSigner(signer: CadesSignSigner): Promise<CryptoProVerifySigner> {
	const certificate = await signer.Certificate
	const [subject, issuer, thumbprint, validTo] = await Promise.all([
		certificate.SubjectName,
		certificate.IssuerName,
		certificate.Thumbprint,
		certificate.ValidToDate,
	])
	const fields = parseSubject(subject)
	return {
		name: ownerName(fields),
		organization: fields.organization,
		inn: fields.inn || fields.innLe,
		thumbprint: thumbprint.toUpperCase(),
		issuer: parseSubject(issuer).commonName,
		validTo: validTo instanceof Date ? validTo : new Date(validTo),
		signingTime: await optionalDate(signer.SigningTime),
		timeStampTime: await optionalDate(signer.SignatureTimeStampTime),
		isSignatureValid: await isTrue(async () => (await signer.SignatureStatus).IsValid),
		isCertificateValid: await isTrue(async () => (await certificate.IsValid()).Result),
	}
}

async function readSigners(signedData: CadesSignSignedData): Promise<CryptoProVerifySigner[]> {
	const signers = await signedData.Signers
	const count = await signers.Count
	const result: CryptoProVerifySigner[] = []
	for (let index = 1; index <= count; index++) result.push(await readSigner(await signers.Item(index)))
	return result
}

async function verifyByHash(plugin: CadesSignPlugin, signedData: CadesSignSignedData, request: CryptoProVerifyRequest): Promise<void> {
	const data = request.data ?? ''
	try {
		const hashed = await hashData(plugin, data, { algorithm: CADES_SIGN.HASH_GOST_2012_256, onProgress: request.onProgress })
		await signedData.VerifyHash(hashed, request.signature, CADES_SIGN.CADES_BES)
	} catch (error) {
		const hashed = await hashData(plugin, data, { algorithm: CADES_SIGN.HASH_GOST_2012_512, onProgress: request.onProgress })
		await signedData.VerifyHash(hashed, request.signature, CADES_SIGN.CADES_BES).catch(() => Promise.reject(error))
	}
}

async function verifyContent(plugin: CadesSignPlugin, signedData: CadesSignSignedData, request: CryptoProVerifyRequest): Promise<void> {
	const data = request.data
	if (data !== undefined) {
		await signedData.propset_ContentEncoding(CADES.BASE64_TO_BINARY)
		await signedData.propset_Content(bytesToBase64(await toBytes(data)))
	}
	await signedData.VerifyCades(request.signature, CADES_SIGN.CADES_BES, data !== undefined)
}

export async function verifySignature(plugin: CadesSignPlugin, request: CryptoProVerifyRequest): Promise<CryptoProVerifySigner[]> {
	const signedData = await plugin.CreateObjectAsync('CAdESCOM.CadesSignedData')
	if (request.isHash) await verifyByHash(plugin, signedData, request)
	else await verifyContent(plugin, signedData, request)
	return readSigners(signedData)
}
