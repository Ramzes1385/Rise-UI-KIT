import { formatMessage } from '@/locales/state'
/** Утилиты: ошибки КриптоПро — код по тексту плагина (`0x8010006E` и др.) и текст из словаря `cryptopro` */
import { UI_CRYPTOPRO } from '@/locales/messages'
import type { CadesPlugin } from '../types/cadesplugin.types'
import type { CryptoProFailure, CryptoProErrorCode } from '../types/useCryptoPro.types'

const MESSAGE_KEYS: Record<CryptoProErrorCode, keyof typeof UI_CRYPTOPRO> = {
	noScript: 'NO_SCRIPT',
	scriptFailed: 'SCRIPT_FAILED',
	noExtension: 'NO_EXTENSION',
	noPlugin: 'NO_PLUGIN',
	noCsp: 'NO_CSP',
	objectsFailed: 'OBJECTS_FAILED',
	noCertificates: 'NO_CERTIFICATES',
	certificateNotFound: 'CERTIFICATE_NOT_FOUND',
	noPrivateKey: 'NO_PRIVATE_KEY',
	certificateInvalid: 'CERTIFICATE_INVALID',
	cancelled: 'CANCELLED',
	unknown: 'UNKNOWN',
}

const NATIVE_CODES: Array<[CryptoProErrorCode, string[]]> = [
	['cancelled', ['8010006E', '800704C7']],
	['noPrivateKey', ['8009200B', '80090016', '8009000D']],
	['certificateNotFound', ['80092004']],
	['certificateInvalid', ['800B0101', '800B010A', '800B0109', '800B010C', '80092012', '80092013']],
]

/** Ошибка `useCryptoPro`: `code` — для логики приложения, `message` — для пользователя, `detail` — текст плагина */
export class CryptoProError extends Error implements CryptoProFailure {
	readonly code: CryptoProErrorCode
	readonly detail: string

	constructor(code: CryptoProErrorCode, detail = '') {
		const template = UI_CRYPTOPRO[MESSAGE_KEYS[code]]
		super(code === 'unknown' ? formatMessage(template, { message: detail }) : template)
		this.name = 'CryptoProError'
		this.code = code
		this.detail = detail
	}
}

function errorText(plugin: CadesPlugin | undefined, error: unknown): string {
	if (plugin) {
		try {
			return plugin.getLastError(error)
		} catch {
			/* getLastError бросает, если плагин не дал текста — берём сообщение самой ошибки */
		}
	}
	return error instanceof Error ? error.message : String(error)
}

function codeFromText(text: string): CryptoProErrorCode | null {
	const native = /0x([0-9a-f]{8})/i.exec(text)?.[1]?.toUpperCase()
	if (!native) return null
	return NATIVE_CODES.find(([, codes]) => codes.includes(native))?.[0] ?? null
}

/** Ошибка плагина как `CryptoProError`: код — по коду в тексте, иначе `fallback`; `CryptoProError` возвращается как есть */
export function toCryptoProError(error: unknown, plugin?: CadesPlugin, fallback: CryptoProErrorCode = 'unknown'): CryptoProError {
	if (error instanceof CryptoProError) return error
	const text = errorText(plugin, error)
	return new CryptoProError(codeFromText(text) ?? fallback, text)
}
