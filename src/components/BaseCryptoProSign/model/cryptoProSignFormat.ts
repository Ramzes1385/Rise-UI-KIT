import { formatFileSize } from '@utils/media/fileUtils'
import { formatMessage, pluralize } from '@/locales/state'
import { UI_CRYPTOPRO, UI_PLURAL } from '@/locales/messages'
import { formatDateText } from '@utils/data/dateFormatUtils'
import type { BaseSelectOption } from '@components/BaseSelect'
import type { CryptoProSignMode } from '../types/BaseCryptoProSign.types'
import type { CryptoProCertificate } from '@composables/crypto/useCryptoPro'

const DAY = 24 * 60 * 60 * 1000
const EXPIRY_WARNING_DAYS = 30

export function formatDate(date: Date, withTime = false): string {
	const time: Intl.DateTimeFormatOptions = withTime ? { hour: '2-digit', minute: '2-digit' } : {}
	return formatDateText(date, { day: '2-digit', month: '2-digit', year: 'numeric', ...time })
}

export function isUsable(certificate: CryptoProCertificate, now: Date): boolean {
	return certificate.hasPrivateKey && certificate.isValid && certificate.validTo.getTime() > now.getTime()
}

function validity(certificate: CryptoProCertificate, now: Date): string {
	const left = certificate.validTo.getTime() - now.getTime()
	if (left <= 0) return formatMessage(UI_CRYPTOPRO.EXPIRED, { date: formatDate(certificate.validTo) })
	if (!certificate.hasPrivateKey) return UI_CRYPTOPRO.NO_KEY
	if (!certificate.isValid) return UI_CRYPTOPRO.NOT_VALID
	const days = Math.floor(left / DAY)
	if (days > EXPIRY_WARNING_DAYS) return formatMessage(UI_CRYPTOPRO.VALID_TO, { date: formatDate(certificate.validTo) })
	return days === 0 ? UI_CRYPTOPRO.EXPIRES_TODAY : pluralize(UI_PLURAL.CRYPTOPRO_EXPIRES, days)
}

export function certificateOption(certificate: CryptoProCertificate, now: Date): BaseSelectOption {
	const inn = certificate.inn || certificate.innLe
	const parts = [certificate.organization, inn ? formatMessage(UI_CRYPTOPRO.INN, { inn }) : '', validity(certificate, now)]
	return {
		value: certificate.thumbprint,
		label: certificate.name || certificate.commonName,
		description: parts.filter(Boolean).join(' · '),
		isDisabled: !isUsable(certificate, now),
	}
}

function textSource(mode: CryptoProSignMode): string {
	if (mode === 'verify') return UI_CRYPTOPRO.SOURCE_TEXT_VERIFY
	return mode === 'cosign' ? UI_CRYPTOPRO.SOURCE_TEXT_COSIGN : UI_CRYPTOPRO.SOURCE_TEXT
}

export function describeSource(source: string | Blob, fileName: string, mode: CryptoProSignMode = 'sign'): string {
	const size = formatFileSize(typeof source === 'string' ? new TextEncoder().encode(source).length : source.size)
	if (typeof source === 'string') return formatMessage(textSource(mode), { size })
	return formatMessage(UI_CRYPTOPRO.SOURCE_FILE, { name: fileName, size })
}

export function base64ToBlob(value: string): Blob {
	return new Blob([Uint8Array.from(atob(value), char => char.charCodeAt(0))], { type: 'application/pkcs7-signature' })
}
