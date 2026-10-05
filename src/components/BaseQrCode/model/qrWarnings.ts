import { watchEffect } from 'vue'
import { warn } from '@/locales/warn'
import { UI_WARNINGS } from '@/locales/messages'
import { parseColor } from '@utils/data/colorUtils'
import { foreignOrigin, isSafeLogo } from './qrLogoUrl'
import type { BaseQrCodeProps } from '../types/BaseQrCode.types'

const MIN_CONTRAST = 3

const MIN_MARGIN = 2

const URL_PREVIEW = 80

const warned = new Set<string>()

function warnOnce(message: string, params: Record<string, string | number>): void {
	const key = `${message}\u0000${JSON.stringify(params)}`
	if (warned.has(key)) return
	warned.add(key)
	warn(message, params)
}

const channel = (value: number): number => {
	const share = value / 255
	return share <= 0.04045 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4
}

function luminance(color: string): number | null {
	const rgb = parseColor(color)
	return rgb && 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b)
}

function checkContrast(module: string, background: string): void {
	const [dark, light] = [luminance(module), luminance(background)]
	if (dark === null || light === null) return
	if (dark > light) return warnOnce(UI_WARNINGS.QR_INVERTED, { module, background })
	const ratio = (light + 0.05) / (dark + 0.05)
	if (ratio < MIN_CONTRAST) warnOnce(UI_WARNINGS.QR_LOW_CONTRAST, { module, background, ratio: ratio.toFixed(2) })
}

function checkLogo(logo: string | undefined): void {
	if (!logo) return
	if (!isSafeLogo(logo)) return warnOnce(UI_WARNINGS.QR_UNSAFE_LOGO, { url: logo.slice(0, URL_PREVIEW) })
	const origin = foreignOrigin(logo)
	if (origin) warnOnce(UI_WARNINGS.QR_EXTERNAL_LOGO, { origin })
}

export function useQrWarnings(props: BaseQrCodeProps): void {
	watchEffect(() => {
		checkLogo(props.logo)
		const module = props.moduleColor ?? '#000000'
		const background = props.backgroundColor ?? '#ffffff'
		checkContrast(module, background)
		if (props.finderColor && props.finderColor !== module) checkContrast(props.finderColor, background)
		const margin = Math.max(0, Math.round(props.margin ?? 4))
		if (margin < MIN_MARGIN) warnOnce(UI_WARNINGS.QR_SMALL_MARGIN, { margin })
	})
}
