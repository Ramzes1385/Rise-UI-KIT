import type {
	CadesPlugin,
	CadesSigner,
	CadesSignedData,
	CadesCertificate,
	CadesObjects,
} from '@composables/crypto/useCryptoPro/types/cadesplugin.types'

/** `CAdESCOM.HashedData` — хэш ГОСТ Р 34.11-2012: данные подаются частями в Base64 */
export interface CadesHashedData {
	/** Алгоритм: `CADESCOM_HASH_ALGORITHM_CP_GOST_3411_2012_256` (101) или `_512` (102) */
	propset_Algorithm(algorithm: number): Promise<void>
	/** Кодировка данных: `CADESCOM_BASE64_TO_BINARY` — части в Base64 */
	propset_DataEncoding(encoding: number): Promise<void>
	/** Добавляет часть данных; вызывается сколько угодно раз до подписи */
	Hash(data: string): Promise<void>
	/** Значение хэша — шестнадцатеричная строка */
	readonly Value: Promise<string>
}

/** `CAdESCOM.CPAttribute` — подписанный атрибут, кит ставит время подписи */
export interface CadesAttribute {
	/** Имя: `CAPICOM_AUTHENTICATED_ATTRIBUTE_SIGNING_TIME` (0) */
	propset_Name(name: number): Promise<void>
	propset_Value(value: Date): Promise<void>
}

/** Подписанные атрибуты подписанта */
interface CadesAttributes {
	Add(attribute: CadesAttribute): Promise<void>
}

/** Алгоритм открытого ключа: OID */
interface CadesOid {
	readonly Value: Promise<string>
}

/** Открытый ключ сертификата */
interface CadesPublicKey {
	readonly Algorithm: Promise<CadesOid>
}

/** Сертификат с открытым ключом: по алгоритму ключа выбирается хэш 256 или 512 */
export interface CadesKeyCertificate extends CadesCertificate {
	PublicKey(): Promise<CadesPublicKey>
}

/** Состояние подписи после проверки */
interface CadesSignatureStatus {
	readonly IsValid: Promise<boolean>
}

/** Подписант: для подписи — служба штампов времени и атрибуты; после проверки — сертификат и время */
export interface CadesSignSigner extends CadesSigner {
	/** Адрес службы штампов времени (TSP) для CAdES-T и CAdES-X Long Type 1 */
	propset_TSAAddress(address: string): Promise<void>
	readonly AuthenticatedAttributes2: Promise<CadesAttributes>
	readonly Certificate: Promise<CadesCertificate>
	/** Время из атрибута `signingTime`; нет атрибута — плагин бросает ошибку */
	readonly SigningTime: Promise<Date | string>
	/** Время штампа подписи (CAdES-T и выше); нет штампа — плагин бросает ошибку */
	readonly SignatureTimeStampTime: Promise<Date | string>
	readonly SignatureStatus: Promise<CadesSignatureStatus>
}

/** Подписанты в подписи: номера с 1 */
interface CadesSigners {
	readonly Count: Promise<number>
	Item(index: number): Promise<CadesSignSigner>
}

/** `CAdESCOM.CadesSignedData` с подписью хэша и проверкой */
export interface CadesSignSignedData extends CadesSignedData {
	/** Отсоединённая подпись хэша; результат — Base64 */
	SignHash(hash: CadesHashedData, signer: CadesSigner, type: number): Promise<string>
	/** Проверка подписи; отсоединённой — после `propset_Content` с теми же данными */
	VerifyCades(signature: string, type: number, isDetached: boolean): Promise<void>
	/** Проверка отсоединённой подписи по хэшу данных */
	VerifyHash(hash: CadesHashedData, signature: string, type: number): Promise<void>
	readonly Signers: Promise<CadesSigners>
}

/** Объекты плагина, которые создаёт BaseCryptoProSign */
export interface CadesSignObjects extends Omit<CadesObjects, 'CAdESCOM.CPSigner' | 'CAdESCOM.CadesSignedData'> {
	'CAdESCOM.CPSigner': CadesSignSigner
	'CAdESCOM.CadesSignedData': CadesSignSignedData
	'CAdESCOM.HashedData': CadesHashedData
	'CAdESCOM.CPAttribute': CadesAttribute
}

/** Имя объекта плагина BaseCryptoProSign */
export type CadesSignObjectName = keyof CadesSignObjects

/** `cadesplugin` с объектами подписи хэша, уровней CAdES и проверки */
export interface CadesSignPlugin extends Omit<CadesPlugin, 'CreateObjectAsync'> {
	CreateObjectAsync<K extends CadesSignObjectName>(name: K): Promise<CadesSignObjects[K]>
}

/** Обёртка над `cadesplugin` — сам он thenable (см. `CadesPluginHandle`) */
export interface CadesSignPluginHandle {
	plugin: CadesSignPlugin
}

/** Внутреннее: алгоритм хэша и ход его расчёта, 0…1 */
export interface HashOptions {
	algorithm: number
	onProgress?: (progress: number) => void
}
