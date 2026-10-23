import type { Ref } from 'vue'
import type { UiProp } from '@composables/base/useUi'
import type { BaseComponentProps } from '@composables/base/useBaseComponent'
import type { CryptoProFailure, CryptoProCertificate } from '@composables/crypto/useCryptoPro'

/** Варианты оформления: `default` — рамка и фон, `soft` — фон без рамки, `outline` — только рамка, `ghost` — без рамки и фона */
export const CRYPTO_PRO_SIGN_VARIANTS = ['default', 'soft', 'outline', 'ghost'] as const

/**
 * Части компонента для пропа `ui` (БЭМ-элементы `.base-crypto-pro-sign__<часть>`, `root` — корень `section`):
 * status — диагностика плагина по шагам, empty — «нет сертификатов», certificate — выбор сертификата, source — что подписываем,
 * hint — подсказка о подписи по хэшу, actions — кнопки, batch — очередь файлов при `isMultiple`, result — итог подписи или проверки, error — блок ошибки действия,
 * live — скрытый live-регион для скринридера.
 */
export const CRYPTO_PRO_SIGN_PARTS = [
	'status',
	'empty',
	'certificate',
	'source',
	'hint',
	'actions',
	'batch',
	'result',
	'error',
	'live',
] as const

/** Часть компонента для пропа `ui` */
export type BaseCryptoProSignPart = (typeof CRYPTO_PRO_SIGN_PARTS)[number]

/** Режимы: подпись, проверка подписи и вторая подпись */
export const CRYPTO_PRO_SIGN_MODES = ['sign', 'verify', 'cosign'] as const

/**
 * Режим: `sign` — подписать данные, `verify` — проверить подпись, `cosign` — добавить вторую подпись к уже подписанному документу
 * (`CoSignCades` / `CoSignHash`): подпись, к которой добавляем, — проп `signature` или файл, документ нужен только для отсоединённой
 */
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
	/** Это вторая подпись (`mode="cosign"`): `signature` содержит и прежние подписи, и новую. Без поля (результат, сохранённый до `cosign`) — обычная подпись */
	isCoSign?: boolean
}

/** Состояние файла в очереди подписи нескольких файлов (`isMultiple`) */
export const CRYPTO_PRO_BATCH_STATUSES = ['pending', 'signing', 'signed', 'failed', 'cancelled'] as const

/** Состояние файла в очереди: ждёт, подписывается, подписан, не подписан из-за ошибки, отменён */
export type CryptoProBatchStatus = (typeof CRYPTO_PRO_BATCH_STATUSES)[number]

/** Файл очереди подписи и его итог */
export interface CryptoProBatchItem {
	/** Номер файла в очереди с 1 */
	id: number
	name: string
	/** Размер, байт */
	size: number
	/** Файл больше `hashThreshold`: подписывается его хэш, подпись отсоединённая */
	isHash: boolean
	status: CryptoProBatchStatus
	/** Ход расчёта хэша файла, 0…1; у файлов меньше `hashThreshold` хэш не считается — 0 до подписи и 1 после */
	progress: number
	/** Подпись файла; пока не подписан — `null` */
	result: CryptoProSignResult | null
	/** Ошибка именно этого файла; остальные файлы очередь продолжает */
	error: CryptoProFailure | null
}

/** Итог очереди — событие `signed-all` */
export interface CryptoProBatchResult {
	items: CryptoProBatchItem[]
	signedCount: number
	failedCount: number
	cancelledCount: number
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
	/** Вторая подпись: уже существующая подпись (Base64), к которой добавляется новая */
	coSignature?: string
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
	/** Режим: `sign` (по умолчанию) — подписать, `verify` — проверить подпись, `cosign` — добавить вторую подпись */
	mode?: CryptoProSignMode
	/**
	 * Что подписываем (или данные отсоединённой подписи при проверке): текст или файл. Не задано — пользователь выбирает файл сам
	 */
	data?: CryptoProSignSource
	/** Имя данных для файла подписи `<fileName>.sig`, если `data` — текст; у файла берётся его имя. По умолчанию `document` */
	fileName?: string
	/** Подпись для проверки или для добавления второй (Base64); не задана — пользователь выбирает файл подписи */
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
	/**
	 * Подпись нескольких файлов за раз (`mode="sign"`, без `data`): пользователь выбирает файлы, кит подписывает их по очереди с
	 * ходом, отменой и итогом по каждому файлу — ошибка одного файла не останавливает остальные. Событие `signed` приходит на каждый
	 * файл, `signed-all` — в конце очереди. Для каждого файла отдельно: больше `hashThreshold` — подпись хэша
	 */
	isMultiple?: boolean
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
	/** Подпись создана (при `isMultiple` — для каждого файла по мере готовности) */
	(event: 'signed', result: CryptoProSignResult): void
	/** Очередь `isMultiple` закончена или отменена: итог по каждому файлу */
	(event: 'signed-all', result: CryptoProBatchResult): void
	/** Подпись проверена — верна или нет */
	(event: 'verified', result: CryptoProVerifyResult): void
	/** Ошибка диагностики, сертификатов или подписи: код, текст для пользователя и текст плагина */
	(event: 'error', error: CryptoProFailure): void
}

/** Методы, доступные через `ref` */
export interface BaseCryptoProSignExpose {
	/** Повторная диагностика плагина и чтение сертификатов */
	check(): Promise<void>
	/** Подписывает выбранным сертификатом (при `mode="cosign"` — добавляет вторую подпись); результат — как в событии `signed`, ошибка — `null` */
	sign(): Promise<CryptoProSignResult | null>
	/** Подписывает по очереди все выбранные файлы (`isMultiple`); итог — как в событии `signed-all`, нечего подписывать — `null` */
	signAll(): Promise<CryptoProBatchResult | null>
	/** Отменяет очередь: текущий файл дописывается, остальные не подписываются; в процессе расчёта хэша файл прерывается */
	cancel(): void
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

/** Внутреннее: одно задание подписи — документ, его имя, способ подписи и подпись, к которой добавляем вторую */
export interface CryptoProSignJob {
	data: CryptoProSignSource
	fileName: string
	isHash: boolean
	detached: boolean
	coSignature?: string
	onProgress: (progress: number) => void
}

/** Внутреннее: что нужно очереди подписи нескольких файлов — выбранные файлы и порог хэша */
export interface CryptoProSignBatchContext {
	files: Readonly<Ref<File[]>>
}

/** Внутреннее: список файлов очереди — чтение и замена состояния */
export interface CryptoProBatchList {
	items: Ref<CryptoProBatchItem[]>
	set(value: CryptoProBatchItem[]): void
	patch(index: number, change: Partial<CryptoProBatchItem>): void
	cancelPending(): void
}

/** Внутреннее: очередь в работе — запрошена ли отмена */
export interface CryptoProBatchControl {
	isCancelRequested: boolean
}

/** Внутреннее: всё, что нужно для подписи одного файла очереди */
export interface BatchFileSetup {
	props: BaseCryptoProSignProps
	emit: BaseCryptoProSignEmits
	context: CryptoProSignActionContext
	list: CryptoProBatchList
	control: CryptoProBatchControl
}

/** Внутреннее: части модели, от которых зависит запуск подписи или проверки */
export interface CryptoProSignRunParts {
	isReady: Readonly<Ref<boolean>>
	isBusy: Readonly<Ref<boolean>>
	hasSignature: Readonly<Ref<boolean>>
	hasSource: Readonly<Ref<boolean>>
	isBatch: Readonly<Ref<boolean>>
	hasFiles: Readonly<Ref<boolean>>
	isSelectedUsable: Readonly<Ref<boolean>>
	verify(): Promise<unknown>
	sign(): Promise<unknown>
	signAll(): Promise<unknown>
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
