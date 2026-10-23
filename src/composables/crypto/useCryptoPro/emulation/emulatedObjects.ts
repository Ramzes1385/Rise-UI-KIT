/** Утилиты: объекты эмуляции КриптоПро — About, Store, сертификаты, CPSigner и CadesSignedData с асинхронными свойствами, как у плагина */
import { CADES } from '../core/constants'
import type { EmulationContext, CryptoProEmulatedCertificate } from '../types/cryptoProEmulation.types'
import type {
	CadesAbout,
	CadesCertificate,
	CadesCertificates,
	CadesObjectName,
	CadesObjects,
	CadesSignedData,
	CadesSigner,
	CadesStore,
} from '../types/cadesplugin.types'

/** Ошибки плагина: текст, как у `getLastError`, с кодом в скобках */
export const EMULATED_ERRORS = {
	noExtension: 'Истекло время ожидания загрузки плагина',
	noPlugin: 'Плагин недоступен',
	noCsp: 'Не удается найти указанный файл. (0x80070002)',
	cancel: 'Действие было отменено пользователем. (0x8010006E)',
	noPrivateKey: 'Не удается найти сертификат и закрытый ключ для расшифровки. (0x8009200B)',
	expired: 'Истек срок действия сертификата. (0x800B0101)',
	notFound: 'Не удается найти объект или свойство. (0x80092004)',
	badIndex: 'Неверный индекс. (0x80070057)',
} as const

function describe(context: EmulationContext, value: unknown): unknown {
	if (typeof value !== 'object' || value === null) return value
	const certificate = context.certificates.get(value)
	if (certificate) return `certificate:${certificate.thumbprint}`
	return context.signers.has(value) ? 'CPSigner' : 'object'
}

/** Имя вызова — всегда `Объект.Член`: разбор по первой точке без недостижимых ветвей */
function record(context: EmulationContext, name: `${string}.${string}`, args: unknown[]): void {
	const dot = name.indexOf('.')
	context.calls.push({
		object: name.slice(0, dot),
		member: name.slice(dot + 1),
		args: args.map(arg => describe(context, arg)),
	})
}

function version(value: string) {
	return { toString: (): Promise<string> => Promise.resolve(value) }
}

function about(context: EmulationContext): CadesAbout {
	return {
		get PluginVersion() {
			return Promise.resolve(version(context.pluginVersion))
		},
		CSPVersion: async (provider, type) => {
			record(context, 'About.CSPVersion', [provider, type])
			if (context.scenario === 'noCsp') throw new Error(EMULATED_ERRORS.noCsp)
			return version(context.cspVersion)
		},
		CSPName: async () => 'Crypto-Pro GOST R 34.10-2012 Cryptographic Service Provider',
	}
}

function certificate(context: EmulationContext, data: CryptoProEmulatedCertificate): CadesCertificate {
	const object: CadesCertificate = {
		Thumbprint: Promise.resolve(data.thumbprint),
		SubjectName: Promise.resolve(data.subject),
		IssuerName: Promise.resolve(data.issuer),
		SerialNumber: Promise.resolve(data.serialNumber),
		ValidFromDate: Promise.resolve(data.validFrom.toISOString()),
		ValidToDate: Promise.resolve(data.validTo.toISOString()),
		HasPrivateKey: async () => data.hasPrivateKey,
		IsValid: async () => ({ Result: Promise.resolve(data.validTo.getTime() > context.now.getTime()) }),
	}
	context.certificates.set(object, data)
	return object
}

function collection(context: EmulationContext, list: CryptoProEmulatedCertificate[]): CadesCertificates {
	return {
		Count: Promise.resolve(list.length),
		Item: async index => {
			const data = list[index - 1]
			if (!data) throw new Error(EMULATED_ERRORS.badIndex)
			return certificate(context, data)
		},
		Find: async (type, criteria) => {
			record(context, 'Certificates.Find', [type, criteria])
			const wanted = criteria.toUpperCase()
			return collection(
				context,
				list.filter(item => type === CADES.FIND_SHA1_HASH && item.thumbprint.toUpperCase() === wanted),
			)
		},
	}
}

function store(context: EmulationContext): CadesStore {
	const list = context.scenario === 'noCertificates' ? [] : context.list
	return {
		Open: async (...args) => record(context, 'Store.Open', args),
		get Certificates() {
			return Promise.resolve(collection(context, list))
		},
		Close: async () => record(context, 'Store.Close', []),
	}
}

function signer(context: EmulationContext): CadesSigner {
	const object: CadesSigner = {
		propset_Certificate: async value => {
			record(context, 'CPSigner.propset_Certificate', [value])
			const data = context.certificates.get(value)
			if (data) context.signers.set(object, data)
		},
		propset_CheckCertificate: async value => record(context, 'CPSigner.propset_CheckCertificate', [value]),
	}
	context.signers.set(object, null)
	return object
}

function wait(delay: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, delay))
}

function signatureError(context: EmulationContext, data: CryptoProEmulatedCertificate | undefined): string | null {
	if (context.scenario === 'cancel') return EMULATED_ERRORS.cancel
	if (!data) return EMULATED_ERRORS.notFound
	if (!data.hasPrivateKey) return EMULATED_ERRORS.noPrivateKey
	return data.validTo.getTime() > context.now.getTime() ? null : EMULATED_ERRORS.expired
}

function signedData(context: EmulationContext): CadesSignedData {
	let content = ''
	return {
		propset_ContentEncoding: async value => record(context, 'CadesSignedData.propset_ContentEncoding', [value]),
		propset_Content: async value => {
			record(context, 'CadesSignedData.propset_Content', [value])
			content = value
		},
		SignCades: async (by, type, isDetached) => {
			record(context, 'CadesSignedData.SignCades', [by, type, isDetached])
			if (context.delay > 0) await wait(context.delay)
			const data = context.signers.get(by) ?? undefined
			const error = signatureError(context, data)
			if (error) throw new Error(error)
			const body = isDetached ? '' : content
			return btoa(`RISE-EMULATED-CADES-BES;detached=${isDetached};thumbprint=${data?.thumbprint};content=${body}`)
		},
	}
}

const FACTORIES: { [K in CadesObjectName]: (context: EmulationContext) => CadesObjects[K] } = {
	'CAdESCOM.About': about,
	'CAdESCOM.Store': store,
	'CAdESCOM.CPSigner': signer,
	'CAdESCOM.CadesSignedData': signedData,
}

/** Создаёт объект эмуляции по имени; без КриптоПро CSP создаётся только `CAdESCOM.About` */
export async function createEmulatedObject<K extends CadesObjectName>(context: EmulationContext, name: K): Promise<CadesObjects[K]> {
	record(context, 'cadesplugin.CreateObjectAsync', [name])
	if (context.scenario === 'noCsp' && name !== 'CAdESCOM.About') throw new Error(EMULATED_ERRORS.noCsp)
	return FACTORIES[name](context)
}
