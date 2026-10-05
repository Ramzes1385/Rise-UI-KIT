import { isSafeLogo } from './qrLogoUrl'
import { qrSvgMarkup } from './draw/qrSvg'
import { encodeQr } from './encode/qrCode'
import { useQrReveal } from './useQrReveal'
import { useQrWarnings } from './qrWarnings'
import { UI_QR_CODE } from '@/locales/messages'
import { computed, type ComputedRef } from 'vue'
import { captionText, defaultLabel } from './qrLabel'
import { placeholderParts } from './draw/qrPlaceholder'
import { finderPath, modulePath } from './draw/qrShapes'
import { clampLogoShare, encodeWithLogo } from './encode/qrLogo'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'
import type { BaseQrCodeEmits, BaseQrCodeProps, QrLogoCode, QrSvgParts } from '../types/BaseQrCode.types'

const round = (value: number): number => Math.round(value * 1000) / 1000

const safeLogo = (props: BaseQrCodeProps): string | undefined => (props.logo && isSafeLogo(props.logo) ? props.logo : undefined)

const marginOf = (props: BaseQrCodeProps): number => Math.max(0, Math.round(props.margin ?? 4))

function colorsOf(props: BaseQrCodeProps): QrSvgParts['colors'] {
	const module = props.moduleColor ?? '#000000'
	return { background: props.backgroundColor ?? '#ffffff', module, finder: props.finderColor ?? module }
}

function useQrCode(props: BaseQrCodeProps): ComputedRef<QrLogoCode | null> {
	return computed(() => {
		const logo = safeLogo(props)
		const level = props.errorCorrection ?? (logo ? 'H' : 'M')
		if (logo) return encodeWithLogo(props.value, level, clampLogoShare(props.logoSize))
		const matrix = encodeQr(props.value, level)
		return matrix && { matrix, area: null }
	})
}

function logoBox(props: BaseQrCodeProps, code: QrLogoCode, margin: number): QrSvgParts['logo'] {
	const href = safeLogo(props)
	if (!href || !code.area) return null
	const offset = round(margin + (code.matrix.size - code.area.image) / 2)
	return { href, x: offset, y: offset, size: code.area.image }
}

function useQrParts(props: BaseQrCodeProps, code: ComputedRef<QrLogoCode | null>): ComputedRef<QrSvgParts | null> {
	return computed(() => {
		if (!code.value) return null
		const margin = marginOf(props)
		const { matrix, area } = code.value
		const moduleShape = props.moduleShape ?? 'square'
		const finderShape = props.finderShape ?? 'square'
		return {
			viewSize: matrix.size + margin * 2,
			colors: colorsOf(props),
			modules: modulePath(matrix.modules, { margin, shape: moduleShape, area }),
			finder: finderPath(matrix.size, margin, finderShape),
			crisp: { modules: moduleShape === 'square', finder: finderShape === 'square' },
			logo: logoBox(props, code.value, margin),
		}
	})
}

export function useBaseQrCode(props: BaseQrCodeProps, emit: BaseQrCodeEmits) {
	useQrWarnings(props)
	const parts = useQrParts(props, useQrCode(props))
	const { isHidden, reveal, conceal, revealByButton } = useQrReveal(props, emit)
	return {
		...useStandardBaseComponent('base-qr-code', props, ['root']),
		parts,
		isHidden,
		revealByButton,
		view: computed(() => (isHidden.value ? placeholderParts(marginOf(props), colorsOf(props)) : parts.value)),
		background: computed(() => props.backgroundColor ?? '#ffffff'),
		caption: computed(() => captionText(props, isHidden.value)),
		accessibleLabel: computed(() => {
			if (!parts.value) return UI_QR_CODE.TOO_LONG
			return props.label ?? defaultLabel(props.value)
		}),
		exposed: { getSvg: (): string => (parts.value ? qrSvgMarkup(parts.value) : ''), reveal, conceal },
	}
}
