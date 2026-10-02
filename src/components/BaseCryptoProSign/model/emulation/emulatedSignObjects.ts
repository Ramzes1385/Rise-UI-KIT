import { CADES_SIGN } from '../cades/constants'
import { EMULATED_ERRORS } from '@composables/crypto/useCryptoPro/emulation/emulatedObjects'
import type { CadesCertificate, CadesCertificates, CadesStore } from '@composables/crypto/useCryptoPro/types/cadesplugin.types'
import { EMULATED_SIGN_ERRORS, EmulatedDigest, base64ToBytes, decodeSignature, digestOf, encodeSignature } from './emulatedSignature'
import type { SignatureFields, EmulatedSignContext, EmulatedSignerState, EmulatedSignature } from '../../types/cryptoProSignEmulation.types'
import type {
	CadesAttribute,
	CadesHashedData,
	CadesSignSigner,
	CadesKeyCertificate,
	CadesSignSignedData,
} from '../../types/cadesSign.types'

const LEVELS: Record<number, string> = {
	[CADES_SIGN.CADES_BES]: 'BES',
	[CADES_SIGN.CADES_T]: 'T',
	[CADES_SIGN.CADES_X_LONG_TYPE_1]: 'XLT1',
}

export function record(context: EmulatedSignContext, name: `${string}.${string}`, args: unknown[]): void {
	const dot = name.indexOf('.')
	context.calls.push({ object: name.slice(0, dot), member: name.slice(dot + 1), args })
}

function wait(delay: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, delay))
}

function withKey(context: EmulatedSignContext, certificate: CadesCertificate): CadesKeyCertificate {
	const PublicKey = async () => {
		const thumbprint = (await certificate.Thumbprint).toUpperCase()
		const is512 = (context.options.keys512 ?? []).some(item => item.toUpperCase() === thumbprint)
		const oid = is512 ? CADES_SIGN.KEY_GOST_2012_512 : '1.2.643.7.1.1.1.1'
		return { Algorithm: Promise.resolve({ Value: Promise.resolve(oid) }) }
	}
	return Object.assign(certificate, { PublicKey })
}

function withKeys(context: EmulatedSignContext, collection: CadesCertificates): CadesCertificates {
	return {
		Count: collection.Count,
		Item: async index => withKey(context, await collection.Item(index)),
		Find: async (type, criteria) => withKeys(context, await collection.Find(type, criteria)),
	}
}

export function storeWithKeys(context: EmulatedSignContext, store: CadesStore): CadesStore {
	return {
		Open: (...args) => store.Open(...args),
		Close: () => store.Close(),
		get Certificates() {
			return store.Certificates.then(collection => withKeys(context, collection))
		},
	}
}

async function findCertificate(context: EmulatedSignContext, thumbprint: string): Promise<CadesCertificate> {
	const store = storeWithKeys(context, await context.base.CreateObjectAsync('CAdESCOM.Store'))
	const found = await (await store.Certificates).Find(0, thumbprint)
	if ((await found.Count) === 0) throw new Error(EMULATED_ERRORS.notFound)
	return found.Item(1)
}

function optionalDate(value: Date | null): Promise<Date> {
	return value ? Promise.resolve(value) : Promise.reject(new Error(EMULATED_ERRORS.notFound))
}

export function signer(context: EmulatedSignContext, preset?: EmulatedSignerState): CadesSignSigner {
	const state: EmulatedSignerState = preset ?? { thumbprint: '', tsaAddress: '', signingTime: null, timeStamp: null }
	const object: CadesSignSigner = {
		propset_Certificate: async value => {
			state.thumbprint = (await value.Thumbprint).toUpperCase()
			record(context, 'CPSigner.propset_Certificate', [`certificate:${state.thumbprint}`])
		},
		propset_CheckCertificate: async value => record(context, 'CPSigner.propset_CheckCertificate', [value]),
		propset_TSAAddress: async value => {
			record(context, 'CPSigner.propset_TSAAddress', [value])
			state.tsaAddress = value
		},
		AuthenticatedAttributes2: Promise.resolve({
			Add: async attribute => {
				record(context, 'CPSigner.AuthenticatedAttributes2.Add', ['CPAttribute'])
				state.signingTime = context.attributes.get(attribute) ?? null
			},
		}),
		get Certificate() {
			return findCertificate(context, state.thumbprint)
		},
		get SigningTime() {
			return optionalDate(state.signingTime)
		},
		get SignatureTimeStampTime() {
			return optionalDate(state.timeStamp)
		},
		SignatureStatus: Promise.resolve({ IsValid: Promise.resolve(true) }),
	}
	context.signers.set(object, state)
	return object
}

export function attribute(context: EmulatedSignContext): CadesAttribute {
	const object: CadesAttribute = {
		propset_Name: async value => record(context, 'CPAttribute.propset_Name', [value]),
		propset_Value: async value => {
			record(context, 'CPAttribute.propset_Value', [value instanceof Date ? 'Date' : value])
			context.attributes.set(object, context.now)
		},
	}
	return object
}

export function hashedData(context: EmulatedSignContext): CadesHashedData {
	let digest = new EmulatedDigest(256)
	const object: CadesHashedData = {
		propset_Algorithm: async value => {
			record(context, 'HashedData.propset_Algorithm', [value])
			digest = new EmulatedDigest(value === CADES_SIGN.HASH_GOST_2012_512 ? 512 : 256)
			context.hashes.set(object, digest)
		},
		propset_DataEncoding: async value => record(context, 'HashedData.propset_DataEncoding', [value]),
		Hash: async value => {
			record(context, 'HashedData.Hash', [value.length])
			digest.update(base64ToBytes(value))
		},
		get Value() {
			const value = digest.value()
			return Promise.resolve(value.slice(value.indexOf(':') + 1))
		},
	}
	context.hashes.set(object, digest)
	return object
}

function signerError(context: EmulatedSignContext, state: EmulatedSignerState | undefined, type: number): string | null {
	if (context.options.scenario === 'cancel') return EMULATED_ERRORS.cancel
	const data = context.list.find(item => item.thumbprint.toUpperCase() === state?.thumbprint)
	if (!data) return EMULATED_ERRORS.notFound
	if (!data.hasPrivateKey) return EMULATED_ERRORS.noPrivateKey
	if (data.validTo.getTime() <= context.now.getTime()) return EMULATED_ERRORS.expired
	return type !== CADES_SIGN.CADES_BES && !state?.tsaAddress ? EMULATED_SIGN_ERRORS.noTsa : null
}

function describeSignature(context: EmulatedSignContext, state: EmulatedSignerState, fields: SignatureFields): EmulatedSignature {
	const level = LEVELS[fields.type] ?? 'BES'
	return {
		level,
		detached: fields.detached,
		thumbprint: state.thumbprint,
		digest: fields.digest,
		signingTime: state.signingTime?.toISOString() ?? '',
		timeStamp: level === 'BES' ? '' : context.now.toISOString(),
		content: fields.detached ? '' : fields.content,
	}
}

async function createSignature(context: EmulatedSignContext, by: CadesSignSigner, fields: SignatureFields): Promise<string> {
	if (context.options.delay) await wait(context.options.delay)
	const state = context.signers.get(by)
	const error = signerError(context, state, fields.type)
	if (error) throw new Error(error)
	return encodeSignature(describeSignature(context, state as EmulatedSignerState, fields))
}

function presetFrom(signature: EmulatedSignature): EmulatedSignerState {
	const date = (value: string): Date | null => (value ? new Date(value) : null)
	return {
		thumbprint: signature.thumbprint,
		tsaAddress: '',
		signingTime: date(signature.signingTime),
		timeStamp: date(signature.timeStamp),
	}
}

function checkContent(signature: EmulatedSignature, isDetached: boolean, content: string): void {
	if (isDetached !== signature.detached)
		throw new Error(signature.detached ? EMULATED_SIGN_ERRORS.noContent : EMULATED_SIGN_ERRORS.badFormat)
	const bits = signature.digest.startsWith('512:') ? 512 : 256
	const data = isDetached ? content : signature.content
	if (digestOf(data, bits) !== signature.digest) throw new Error(EMULATED_SIGN_ERRORS.badHash)
}

export function signedData(context: EmulatedSignContext): CadesSignSignedData {
	let content = ''
	let verified: CadesSignSigner[] = []
	const verify = (signature: EmulatedSignature): void => {
		verified = [signer(context, presetFrom(signature))]
	}
	return {
		propset_ContentEncoding: async value => record(context, 'CadesSignedData.propset_ContentEncoding', [value]),
		propset_Content: async value => {
			record(context, 'CadesSignedData.propset_Content', [value])
			content = value
		},
		SignCades: async (by, type, detached) => {
			record(context, 'CadesSignedData.SignCades', ['CPSigner', type, detached])
			return createSignature(context, by as CadesSignSigner, { type, digest: digestOf(content), content, detached })
		},
		SignHash: async (hash, by, type) => {
			record(context, 'CadesSignedData.SignHash', ['HashedData', 'CPSigner', type])
			const digest = context.hashes.get(hash)?.value() ?? ''
			return createSignature(context, by as CadesSignSigner, { type, digest, content: '', detached: true })
		},
		VerifyCades: async (value, type, isDetached) => {
			record(context, 'CadesSignedData.VerifyCades', [value.length, type, isDetached])
			const signature = decodeSignature(value)
			checkContent(signature, isDetached, content)
			verify(signature)
		},
		VerifyHash: async (hash, value, type) => {
			record(context, 'CadesSignedData.VerifyHash', ['HashedData', value.length, type])
			const signature = decodeSignature(value)
			if (!signature.detached || context.hashes.get(hash)?.value() !== signature.digest) throw new Error(EMULATED_SIGN_ERRORS.badHash)
			verify(signature)
		},
		get Signers() {
			const list = verified
			return Promise.resolve({
				Count: Promise.resolve(list.length),
				Item: async (index: number) => list[index - 1] as CadesSignSigner,
			})
		},
	}
}
