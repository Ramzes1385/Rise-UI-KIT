import type { CadesPlugin } from './cadesplugin.types'

/** Сценарии эмуляции плагина */
export const CRYPTO_PRO_EMULATION_SCENARIOS = ['ready', 'noExtension', 'noPlugin', 'noCsp', 'noCertificates', 'cancel'] as const

/**
 * Сценарий эмуляции: `ready` — всё установлено; `noExtension` — расширение не отвечает; `noPlugin` — расширение есть, плагина нет;
 * `noCsp` — нет КриптоПро CSP; `noCertificates` — хранилище пустое; `cancel` — пользователь отменяет подпись (окно ПИН-кода)
 */
export type CryptoProEmulationScenario = (typeof CRYPTO_PRO_EMULATION_SCENARIOS)[number]

/** Тестовый сертификат эмуляции */
export interface CryptoProEmulatedCertificate {
	/** Отпечаток SHA-1, 40 шестнадцатеричных символов */
	thumbprint: string
	/** Субъект, как его отдаёт плагин: `CN=…, SN=…, G=…, O=…, ИНН=…` */
	subject: string
	issuer: string
	serialNumber: string
	validFrom: Date
	validTo: Date
	hasPrivateKey: boolean
}

/** Настройки эмуляции */
export interface CryptoProEmulationOptions {
	/** Сценарий, по умолчанию `ready` */
	scenario?: CryptoProEmulationScenario
	/** Сертификаты хранилища; по умолчанию — `emulatedCertificates(now)` */
	certificates?: CryptoProEmulatedCertificate[]
	/** «Сегодня» для сертификатов по умолчанию; по умолчанию — текущее время */
	now?: Date
	/** Задержка ответа плагина на подпись, мс; по умолчанию 0 */
	delay?: number
	/** Версия плагина, по умолчанию `2.0.15400` */
	pluginVersion?: string
	/** Версия КриптоПро CSP, по умолчанию `5.0.12000` */
	cspVersion?: string
}

/** Запись журнала вызовов эмуляции: объект, член и аргументы (объекты плагина — именами) */
export interface CryptoProEmulationCall {
	object: string
	member: string
	args: unknown[]
}

/** Эмуляция плагина: объект `cadesplugin`, журнал вызовов и установка в `window` */
export interface CryptoProEmulation {
	plugin: CadesPlugin
	calls: CryptoProEmulationCall[]
	/** Ставит `window.cadesplugin`; возвращает функцию, которая возвращает прежнее значение */
	install(): () => void
}

/** Состояние эмуляции, общее для её объектов */
export interface EmulationContext {
	scenario: CryptoProEmulationScenario
	now: Date
	delay: number
	pluginVersion: string
	cspVersion: string
	list: CryptoProEmulatedCertificate[]
	calls: CryptoProEmulationCall[]
	/** Объекты сертификатов — их данные */
	certificates: WeakMap<object, CryptoProEmulatedCertificate>
	/** Объекты CPSigner — сертификат подписанта или `null`, пока не задан */
	signers: WeakMap<object, CryptoProEmulatedCertificate | null>
}
