/** Утилиты: сертификаты КриптоПро — чтение личного хранилища текущего пользователя и поиск по отпечатку */
import { CADES } from '../constants'
import { CryptoProError } from '../errors'
import { ownerName, parseSubject } from './subject'
import type { CryptoProCertificate } from '../../types/useCryptoPro.types'
import type { CadesPlugin, CadesStore, CadesCertificate } from '../../types/cadesplugin.types'

function toDate(value: Date | string): Date {
	return value instanceof Date ? value : new Date(value)
}

async function isCertificateValid(certificate: CadesCertificate): Promise<boolean> {
	try {
		const status = await certificate.IsValid()
		return await status.Result
	} catch {
		return false
	}
}

async function readCertificate(certificate: CadesCertificate): Promise<CryptoProCertificate> {
	const [thumbprint, subject, issuerSubject, serialNumber, validFrom, validTo, hasPrivateKey, isValid] = await Promise.all([
		certificate.Thumbprint,
		certificate.SubjectName,
		certificate.IssuerName,
		certificate.SerialNumber,
		certificate.ValidFromDate,
		certificate.ValidToDate,
		certificate.HasPrivateKey(),
		isCertificateValid(certificate),
	])
	const fields = parseSubject(subject)
	const { commonName, organization, position, email, inn, innLe, ogrn, ogrnip, snils } = fields
	return {
		thumbprint: thumbprint.toUpperCase(),
		name: ownerName(fields),
		...{ commonName, organization, position, email, inn, innLe, ogrn, ogrnip, snils },
		issuer: parseSubject(issuerSubject).commonName,
		subject,
		serialNumber,
		validFrom: toDate(validFrom),
		validTo: toDate(validTo),
		hasPrivateKey,
		isValid,
	}
}

/** Открывает личное хранилище текущего пользователя */
export async function openStore(plugin: CadesPlugin): Promise<CadesStore> {
	const store = await plugin.CreateObjectAsync('CAdESCOM.Store')
	await store.Open(CADES.CURRENT_USER_STORE, CADES.MY_STORE, CADES.STORE_OPEN_MAXIMUM_ALLOWED)
	return store
}

/** Закрывает хранилище; ошибку закрытия не пробрасывает — результат уже получен */
export async function closeStore(store: CadesStore): Promise<void> {
	await store.Close().catch(() => undefined)
}

/** Все сертификаты личного хранилища, по порядку плагина; читаются по одному — вызовы плагина идут через расширение */
export async function listCertificates(plugin: CadesPlugin): Promise<CryptoProCertificate[]> {
	const store = await openStore(plugin)
	try {
		const collection = await store.Certificates
		const count = await collection.Count
		const result: CryptoProCertificate[] = []
		for (let index = 1; index <= count; index++) result.push(await readCertificate(await collection.Item(index)))
		return result
	} finally {
		await closeStore(store)
	}
}

/** Сертификат из открытого хранилища по отпечатку и его данные; нет такого — ошибка `certificateNotFound` */
export async function findCertificate(
	store: CadesStore,
	thumbprint: string,
): Promise<{ certificate: CadesCertificate; info: CryptoProCertificate }> {
	const collection = await store.Certificates
	const found = await collection.Find(CADES.FIND_SHA1_HASH, thumbprint)
	if ((await found.Count) === 0) throw new CryptoProError('certificateNotFound', thumbprint)
	const certificate = await found.Item(1)
	return { certificate, info: await readCertificate(certificate) }
}
