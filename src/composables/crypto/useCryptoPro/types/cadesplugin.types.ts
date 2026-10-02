/** Версия из `CAdESCOM.About`: строка — через `toString()`, в асинхронном API она тоже обещание */
interface CadesVersion {
	toString(): Promise<string> | string
}

/** `CAdESCOM.About` — версии плагина и криптопровайдера */
export interface CadesAbout {
	readonly PluginVersion: Promise<CadesVersion>
	/** Версия криптопровайдера: имя (пустое — по умолчанию) и тип, у ГОСТ 2012 — 80 */
	CSPVersion(provider: string, type: number): Promise<CadesVersion>
	CSPName(type: number): Promise<string>
}

/** Результат `Certificate.IsValid()` — проверка цепочки и срока */
interface CadesCertificateStatus {
	readonly Result: Promise<boolean>
}

/** Сертификат из хранилища: каждое свойство в асинхронном API — обещание */
export interface CadesCertificate {
	readonly Thumbprint: Promise<string>
	readonly SubjectName: Promise<string>
	readonly IssuerName: Promise<string>
	readonly SerialNumber: Promise<string>
	/** Дата: в NPAPI — `Date`, через расширение — строка */
	readonly ValidFromDate: Promise<Date | string>
	readonly ValidToDate: Promise<Date | string>
	HasPrivateKey(): Promise<boolean>
	IsValid(): Promise<CadesCertificateStatus>
}

/** Коллекция сертификатов: номера элементов — с 1 */
export interface CadesCertificates {
	readonly Count: Promise<number>
	Item(index: number): Promise<CadesCertificate>
	/** Поиск: тип (`CAPICOM_CERTIFICATE_FIND_SHA1_HASH` — по отпечатку) и значение */
	Find(type: number, criteria: string, isValidOnly?: boolean): Promise<CadesCertificates>
}

/** `CAdESCOM.Store` — хранилище сертификатов */
export interface CadesStore {
	Open(location: number, name: string, mode: number): Promise<void>
	readonly Certificates: Promise<CadesCertificates>
	Close(): Promise<void>
}

/** `CAdESCOM.CPSigner` — кто подписывает */
export interface CadesSigner {
	propset_Certificate(certificate: CadesCertificate): Promise<void>
	propset_CheckCertificate(isChecked: boolean): Promise<void>
}

/** `CAdESCOM.CadesSignedData` — данные и подпись CAdES */
export interface CadesSignedData {
	propset_ContentEncoding(encoding: number): Promise<void>
	propset_Content(content: string): Promise<void>
	/** Подпись: тип CAdES (`CADESCOM_CADES_BES`) и отсоединённая ли; результат — Base64 */
	SignCades(signer: CadesSigner, type: number, isDetached: boolean): Promise<string>
}

/** Объекты плагина, которые создаёт `useCryptoPro` */
export interface CadesObjects {
	'CAdESCOM.About': CadesAbout
	'CAdESCOM.Store': CadesStore
	'CAdESCOM.CPSigner': CadesSigner
	'CAdESCOM.CadesSignedData': CadesSignedData
}

/** Имя объекта плагина */
export type CadesObjectName = keyof CadesObjects

/**
 * `window.cadesplugin` из `cadesplugin_api.js` — обещание: исполняется, когда плагин загружен, отклоняется, когда недоступен.
 * Используется только асинхронный API
 */
export interface CadesPlugin extends PromiseLike<void> {
	CreateObjectAsync<K extends CadesObjectName>(name: K): Promise<CadesObjects[K]>
	/** Текст последней ошибки плагина с кодом вида `(0x8010006E)` */
	getLastError(error: unknown): string
}

/** Глобальные имена `cadesplugin_api.js` */
export interface CadesWindow {
	cadesplugin?: CadesPlugin
	/** Вызывается скриптом, когда расширение браузера ответило */
	cadesplugin_extension_loaded_callback?: () => void
}
