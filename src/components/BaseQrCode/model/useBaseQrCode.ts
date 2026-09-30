import { qrSvgMarkup } from './draw/qrSvg'
import { encodeQr } from './encode/qrCode'
import { UI_QR_CODE } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import { computed, type ComputedRef } from 'vue'
import { finderPath, modulePath } from './draw/qrShapes'
import { clampLogoShare, encodeWithLogo } from './encode/qrLogo'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseQrCodeProps, QrLogoCode, QrSvgParts } from '../types/BaseQrCode.types'

const round = (value: number): number => Math.round(value * 1000) / 1000

function useQrCode(props: BaseQrCodeProps): ComputedRef<QrLogoCode | null> {
	return computed(() => {
		const level = props.errorCorrection ?? (props.logo ? 'H' : 'M')
		if (props.logo) return encodeWithLogo(props.value, level, clampLogoShare(props.logoSize))
		const matrix = encodeQr(props.value, level)
		return matrix && { matrix, area: null }
	})
}

function logoBox(props: BaseQrCodeProps, code: QrLogoCode, margin: number): QrSvgParts['logo'] {
	if (!props.logo || !code.area) return null
	const offset = round(margin + (code.matrix.size - code.area.image) / 2)
	return { href: props.logo, x: offset, y: offset, size: code.area.image }
}

function useQrParts(props: BaseQrCodeProps, code: ComputedRef<QrLogoCode | null>): ComputedRef<QrSvgParts | null> {
	return computed(() => {
		if (!code.value) return null
		const margin = Math.max(0, Math.round(props.margin ?? 4))
		const { matrix, area } = code.value
		const moduleShape = props.moduleShape ?? 'square'
		const finderShape = props.finderShape ?? 'square'
		const module = props.moduleColor ?? '#000000'
		return {
			viewSize: matrix.size + margin * 2,
			colors: { background: props.backgroundColor ?? '#ffffff', module, finder: props.finderColor ?? module },
			modules: modulePath(matrix.modules, { margin, shape: moduleShape, area }),
			finder: finderPath(matrix.size, margin, finderShape),
			crisp: { modules: moduleShape === 'square', finder: finderShape === 'square' },
			logo: logoBox(props, code.value, margin),
		}
	})
}

export function useBaseQrCode(props: BaseQrCodeProps) {
	const parts = useQrParts(props, useQrCode(props))
	return {
		...useStandardBaseComponent('base-qr-code', props, ['root']),
		parts,
		background: computed(() => props.backgroundColor ?? '#ffffff'),
		accessibleLabel: computed(() => {
			if (!parts.value) return UI_QR_CODE.TOO_LONG
			return props.label ?? formatMessage(UI_QR_CODE.LABEL, { value: props.value })
		}),
		getSvg: (): string => (parts.value ? qrSvgMarkup(parts.value) : ''),
	}
}
