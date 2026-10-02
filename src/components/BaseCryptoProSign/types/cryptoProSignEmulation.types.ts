import type { CadesPlugin } from '@composables/crypto/useCryptoPro/types/cadesplugin.types'
import type { CryptoProEmulationCall, CryptoProEmulationOptions, CryptoProEmulatedCertificate } from '@composables/crypto/useCryptoPro'

/** Настройки эмуляции BaseCryptoProSign: всё из `createCryptoProEmulation` и алгоритмы ключей */
export interface CryptoProSignEmulationOptions extends CryptoProEmulationOptions {
	/** Ключи ГОСТ Р 34.10-2012 512 бит — отпечатки сертификатов; у остальных 256 бит (хэш 34.11-2012 256) */
	keys512?: string[]
}

/** Внутреннее: подписант эмуляции — сертификат, служба штампов и время подписи */
export interface EmulatedSignerState {
	thumbprint: string
	tsaAddress: string
	signingTime: Date | null
	/** Время штампа — у подписанта из проверенной подписи уровня T и выше */
	timeStamp: Date | null
}

/** Внутреннее: разобранная подпись эмуляции */
export interface EmulatedSignature {
	level: string
	detached: boolean
	thumbprint: string
	digest: string
	signingTime: string
	timeStamp: string
	content: string
}

/** Внутреннее: хэш эмуляции, который считается по частям */
interface EmulatedHash {
	update(bytes: Uint8Array): void
	value(): string
}

/** Внутреннее: состояние эмуляции BaseCryptoProSign, общее для её объектов */
export interface EmulatedSignContext {
	/** Плагин базовой эмуляции `useCryptoPro`: About, Store, сертификаты */
	base: CadesPlugin
	options: CryptoProSignEmulationOptions
	now: Date
	list: CryptoProEmulatedCertificate[]
	calls: CryptoProEmulationCall[]
	signers: WeakMap<object, EmulatedSignerState>
	attributes: WeakMap<object, Date>
	hashes: WeakMap<object, EmulatedHash>
}

/** Внутреннее: что попадает в подпись эмуляции — тип CAdES, хэш, данные и отсоединённая ли */
export interface SignatureFields {
	type: number
	digest: string
	content: string
	detached: boolean
}
