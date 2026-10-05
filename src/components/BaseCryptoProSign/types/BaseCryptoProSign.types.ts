import type { Ref } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { CryptoProFailure, CryptoProCertificate } from '@composables/crypto/useCryptoPro'

/** Варианты оформления: `default` — рамка и фон, `soft` — фон без рамки, `outline` — только рамка, `ghost` — без рамки и фона */
export const CRYPTO_PRO_SIGN_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части компонента для пропа `ui` (БЭМ-элементы `.base-crypto-pro-sign__<часть>`, `root` — корень `section`):
 * status — диагностика плагина по шагам, empty — «нет сертификатов», certificate — выбор сертификата, source — что подписываем,
 * hint — подсказка о подписи по хэшу, actions — кнопки, result — итог подписи или проверки, error — блок ошибки действия,
 * live — скрытый live-регион для скринридера.
 */
export const CRYPTO_PRO_SIGN_PARTS = ['status', 'empty', 'certificate', 'source', 'hint', 'actions', 'result', 'error', 'live'] as const

/** Часть компонента для пропа `ui` */
export type BaseCryptoProSignPart = (typeof CRYPTO_PRO_SIGN_PARTS)[number]

/** Режимы: подпись и проверка подписи */
export const CRYPTO_PRO_SIGN_MODES = ['sign', 'verify'] as const

/** Режим: `sign` — подписать данные, `verify` — проверить подпись */
export type CryptoProSignMode = (typeof CRYPTO_PRO_SIGN_MODES)[number]

/** Уровни подписи CAdES */
export const CRYPTO_PRO_SIGN_LEVELS = ['bes', 't', 'xlt1'] as const

/**
 * Уровень подписи: `bes` — CAdES-BES; `t` — CAdES-T, со штампом времени; `xlt1` — CAdES-X Long Type 1, со штампом и доказательствами
 * действительности сертификата (усовершенствованная подпись). Для `t` и `xlt1` нужна служба штампов времени `tsaAddress`
 */
export type CryptoProSignLevel = (typeof CRYPTO_PRO_SIGN_LEVELS)[number]

/** Что подписываем: текст (подписываются его байты UTF-8) или файл */
export type CryptoProSignSource = string | Blob

/** Результат подписи — событие `signed` */
export interface CryptoProSignResult {
	/** Подпись CAdES в Base64 без переносов строк */
	signature: string
	/** Отсоединённая подпись (без данных внутри) */
	detached: boolean
	/** Подписан хэш файла (`SignHash`): файл больше `hashThreshold`, подпись всегда отсоединённая */
	isHash: boolean
	level: CryptoProSignLevel
	certificate: CryptoProCertificate
	/** Имя подписанного файла или `fileName`; файл подписи — `<fileName>.sig` */
	fileName: string
}

/** Подписант из проверенной подписи */
export interface CryptoProVerifySigner {
	/** ФИО владельца сертификата, без `SN` и `G` — `CN` */
	name: string
	organization: string
	/** ИНН физического лица, без него — ИНН юридического */
	inn: string
	thumbprint: string
	/** Издатель — `CN` удостоверяющего центра */
	issuer: string
	validTo: Date
	/** Время из подписанного атрибута `signingTime`; нет атрибута — `null` */
	signingTime: Date | null
	/** Время штампа (CAdES-T и выше); нет штампа — `null` */
	timeStampTime: Date | null
	isSignatureValid: boolean
	/** Сертификат проходит проверку плагина (`IsValid`) сейчас: срок и цепочка */
	isCertificateValid: boolean
}

/** Результат проверки — событие `verified` */
export interface CryptoProVerifyResult {
	/** Подпись верна: плагин подтвердил её для этих данных */
	isValid: boolean
	/** Проверялась отсоединённая подпись (вместе с данными) */
	isDetached: boolean
	/** Проверялся хэш данных (`VerifyHash`): данные больше `hashThreshold` */
	isHash: boolean
	signers: CryptoProVerifySigner[]
	/** Почему подпись не прошла проверку; `null`, если верна */
	error: CryptoProFailure | null
}

/** Внутреннее: запрос подписи */
export interface CryptoProSignRequest {
	data: CryptoProSignSource
	thumbprint: string
	detached: boolean
	level: CryptoProSignLevel
	tsaAddress: string
	isHash: boolean
	onProgress?: (progress: number) => void
}

/** Внутреннее: запрос проверки; `data` — данные отсоединённой подписи */
export interface CryptoProVerifyRequest {
	signature: string
	data?: CryptoProSignSource
	isHash: boolean
	onProgress?: (progress: number) => void
}

/** Пропсы компонента BaseCryptoProSign */
export interface BaseCryptoProSignProps extends BaseComponentProps<(typeof CRYPTO_PRO_SIGN_VARIANTS)[number], 'root'> {
	/** Режим: `sign` (по умолчанию) — подписать, `verify` — проверить подпись */
	mode?: CryptoProSignMode
	/**
	 * Что подписываем (или данные отсоединённой подписи при проверке): текст или файл. Не задано — пользователь выбирает файл сам
	 */
	data?: CryptoProSignSource
	/** Имя данных для файла подписи `<fileName>.sig`, если `data` — текст; у файла берётся его имя. По умолчанию `document` */
	fileName?: string
	/** Подпись для проверки (Base64); не задана — пользователь выбирает файл подписи */
	signature?: string
	/** Отпечаток выбранного сертификата (`v-model:thumbprint`) */
	thumbprint?: string
	/** Отсоединённая подпись (`v-model:detached`); по умолчанию `false` — присоединённая */
	detached?: boolean
	/** Уровень подписи CAdES; по умолчанию `bes` */
	level?: CryptoProSignLevel
	/** Адрес службы штампов времени (TSP) для уровней `t` и `xlt1`, например `http://testca2012.cryptopro.ru/tsp/tsp.srf` */
	tsaAddress?: string
	/**
	 * Порог размера файла, байт: файл больше порога подписывается и проверяется по хэшу ГОСТ Р 34.11-2012 (`SignHash`), только
	 * отсоединённой подписью — плагин передаёт данные через расширение браузера, и большой файл целиком не проходит. По умолчанию 10 МБ
	 */
	hashThreshold?: number
	/** Адрес `cadesplugin_api.js`, если приложение не подключило его само; удобно задать в настройках плагина кита */
	scriptUrl?: string
	/** Сколько ждать скрипт и ответ плагина, мс; по умолчанию 30000 */
	timeout?: number
	/** Кнопка «Скачать подпись» после подписи; по умолчанию `true` */
	hasDownload?: boolean
	/** Отключает поля и кнопки */
	isDisabled?: boolean
	/**
	 * Классы частей (`root`, `status`, `empty`, `certificate`, `source`, `hint`, `actions`, `result`, `error`, `live`) — добавляются
	 * к классам кита. Глобально — `createUiKitPlugin({ defaults: { BaseCryptoProSign: { ui } } })`, классы плагина и экземпляра склеиваются.
	 *
	 * @example
	 * <BaseCryptoProSign :data="text" :ui="{ root: 'shadow-none', actions: 'justify-end' }" />
	 */
	ui?: UiProp<BaseCryptoProSignPart>
}

/** События компонента BaseCryptoProSign */
export interface BaseCryptoProSignEmits {
	/** Выбран сертификат — отпечаток */
	(event: 'update:thumbprint', value: string): void
	/** Выбрана присоединённая или отсоединённая подпись */
	(event: 'update:detached', value: boolean): void
	/** Подпись создана */
	(event: 'signed', result: CryptoProSignResult): void
	/** Подпись проверена — верна или нет */
	(event: 'verified', result: CryptoProVerifyResult): void
	/** Ошибка диагностики, сертификатов или подписи: код, текст для пользователя и текст плагина */
	(event: 'error', error: CryptoProFailure): void
}

/** Методы, доступные через `ref` */
export interface BaseCryptoProSignExpose {
	/** Повторная диагностика плагина и чтение сертификатов */
	check(): Promise<void>
	/** Подписывает выбранным сертификатом; результат — как в событии `signed`, ошибка — `null` */
	sign(): Promise<CryptoProSignResult | null>
	/** Проверяет подпись; результат — как в событии `verified` */
	verify(): Promise<CryptoProVerifyResult | null>
}

/** Внутреннее: что нужно подписи и проверке — готовность плагина, данные, сертификат и подпись */
export interface CryptoProSignActionContext {
	isReady: Readonly<Ref<boolean>>
	check: () => Promise<boolean>
	source: Readonly<Ref<CryptoProSignSource | undefined>>
	fileName: Readonly<Ref<string>>
	isHash: Readonly<Ref<boolean>>
	isDetached: Readonly<Ref<boolean>>
	certificate: Readonly<Ref<CryptoProCertificate | null>>
	readSignature: () => Promise<string>
}

/** Внутреннее: состояние подписи и проверки — занятость, ход хэша, ошибка и текст для скринридера */
export interface CryptoProSignActionState {
	isBusy: Ref<boolean>
	progress: Ref<number | null>
	actionError: Ref<CryptoProFailure | null>
	announcement: Ref<string>
	start(): void
	finish(): void
	fail(error: unknown): void
	onProgress(value: number): void
}
