import { UI_QR_CODE } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { BaseQrCodeProps } from '../types/BaseQrCode.types'

const LINK_RE = /^https?:\/\//i

function linkHost(value: string): string | null {
	const text = value.trim()
	if (!LINK_RE.test(text)) return null
	try {
		return new URL(text).host || null
	} catch {
		return null
	}
}

export function defaultLabel(value: string): string {
	const host = linkHost(value)
	return host ? formatMessage(UI_QR_CODE.LABEL_LINK, { host }) : UI_QR_CODE.LABEL
}

export function captionText(props: BaseQrCodeProps, isHidden: boolean): string {
	if (isHidden || !props.showValue) return ''
	if (props.showValue === 'host') return linkHost(props.value) ?? ''
	return props.value
}
