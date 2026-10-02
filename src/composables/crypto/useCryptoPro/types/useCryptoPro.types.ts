import type { MaybeRefOrGetter } from 'vue'

/** Шаги диагностики — как на демостранице КриптоПро */
export const CRYPTO_PRO_STEP_IDS = ['extension', 'plugin', 'csp', 'objects'] as const

/** Шаг диагностики: `extension` — расширение браузера, `plugin` — КриптоПро ЭЦП Browser plug-in, `csp` — КриптоПро CSP, `objects` — объекты подписи */
export type CryptoProStepId = (typeof CRYPTO_PRO_STEP_IDS)[number]

/** Состояние шага: ещё не проверялся, проверяется, пройден, ошибка */
export type CryptoProStepState = 'pending' | 'checking' | 'ok' | 'error'

/** Шаг диагностики и его состояние */
export interface CryptoProStep {
	id: CryptoProStepId
	state: CryptoProStepState
}

/** Общее состояние: диагностика не запускалась, идёт, всё готово к подписи, ошибка */
export type CryptoProState = 'idle' | 'checking' | 'ready' | 'error'

/** Коды ошибок; тексты — раздел словаря `cryptopro` */
export const CRYPTO_PRO_ERROR_CODES = [
	'noScript',
	'scriptFailed',
	'noExtension',
	'noPlugin',
	'noCsp',
	'objectsFailed',
	'noCertificates',
	'certificateNotFound',
	'noPrivateKey',
	'certificateInvalid',
	'cancelled',
	'unknown',
] as const

/**
 * Код ошибки: `noScript` — нет `cadesplugin` и не задан `scriptUrl`; `scriptFailed` — скрипт не загрузился; `noExtension` — расширение
 * не ответило; `noPlugin` — расширение есть, плагин не отвечает; `noCsp` — нет КриптоПро CSP; `objectsFailed` — объекты подписи не
 * создаются; `noCertificates` — в хранилище нет сертификатов; `certificateNotFound` — нет сертификата с таким отпечатком;
 * `noPrivateKey` — у сертификата нет закрытого ключа; `certificateInvalid` — сертификат просрочен или не проходит проверку цепочки;
 * `cancelled` — пользователь отменил (окно ПИН-кода); `unknown` — прочее, текст плагина — в `detail`
 */
export type CryptoProErrorCode = (typeof CRYPTO_PRO_ERROR_CODES)[number]

/** Ошибка `useCryptoPro`: код, текст из словаря и текст плагина с кодом вида `(0x8010006E)` */
export interface CryptoProFailure {
	code: CryptoProErrorCode
	message: string
	/** Текст ошибки плагина (`cadesplugin.getLastError`) или пустая строка */
	detail: string
}

/** Диагностика: общее состояние, шаги, версии и ошибка */
export interface CryptoProStatus {
	state: CryptoProState
	steps: CryptoProStep[]
	/** Версия КриптоПро ЭЦП Browser plug-in (`CAdESCOM.About`), пустая до проверки */
	pluginVersion: string
	/** Версия КриптоПро CSP */
	cspVersion: string
	/** Название криптопровайдера ГОСТ Р 34.10-2012 */
	cspName: string
	/** Ошибка диагностики; ошибки сертификатов и подписи — в `error` composable */
	error: CryptoProFailure | null
}

/** Сертификат из личного хранилища текущего пользователя; поля, которых нет в субъекте, — пустые строки */
export interface CryptoProCertificate {
	/** Отпечаток SHA-1 — по нему выбирается сертификат для подписи */
	thumbprint: string
	/** ФИО владельца: фамилия (`SN`) и имя с отчеством (`G`), без них — `CN` */
	name: string
	/** Общее имя `CN` */
	commonName: string
	/** Организация `O` */
	organization: string
	/** Должность `T` */
	position: string
	email: string
	/** ИНН физического лица */
	inn: string
	/** ИНН юридического лица */
	innLe: string
	/** ОГРН организации */
	ogrn: string
	/** ОГРНИП индивидуального предпринимателя */
	ogrnip: string
	snils: string
	/** Издатель — `CN` удостоверяющего центра */
	issuer: string
	/** Субъект целиком, как его отдаёт плагин */
	subject: string
	serialNumber: string
	validFrom: Date
	validTo: Date
	/** Есть ли закрытый ключ — без него подписать нельзя */
	hasPrivateKey: boolean
	/** Сертификат проходит проверку плагина (`IsValid`): срок и цепочка */
	isValid: boolean
}

/** Что подписываем: строка (подписываются её байты UTF-8), файл или двоичные данные */
export type CryptoProSignData = string | Blob | ArrayBuffer | ArrayBufferView

/** Параметры подписи */
export interface CryptoProSignOptions {
	/** Отпечаток сертификата из `getCertificates()` */
	thumbprint: string
	/** Отсоединённая подпись (без данных внутри); по умолчанию `false` — присоединённая */
	detached?: boolean
}

/** Настройки `useCryptoPro` */
export interface UseCryptoProOptions {
	/**
	 * Адрес `cadesplugin_api.js`: скрипт загружается при первой проверке, если на странице ещё нет `window.cadesplugin`.
	 * Кит скрипт не содержит — его раздаёт приложение (скачивается с сайта КриптоПро)
	 */
	scriptUrl?: MaybeRefOrGetter<string | undefined>
	/** Сколько ждать загрузки скрипта и ответа плагина, мс; по умолчанию 30000 */
	timeout?: number
	/** Запускать диагностику после монтирования; по умолчанию `true`. До `onMounted` composable ничего не трогает (SSR) */
	checkOnMount?: boolean
}

/** Внутреннее: что нужно диагностике — адрес скрипта, таймаут и состояние, которое она обновляет */
export interface DiagnosticsContext {
	scriptUrl: string | undefined
	timeout: number
	status: CryptoProStatus
}
