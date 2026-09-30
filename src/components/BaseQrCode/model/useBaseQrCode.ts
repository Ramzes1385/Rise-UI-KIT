import { computed } from 'vue'
import { encodeQr, qrPath } from './qr/qrCode'
import { UI_QR_CODE } from '@/locales/messages'
import { formatMessage } from '@/locales/state'
import type { BaseQrCodeProps } from '../types/BaseQrCode.types'
import { useStandardBaseComponent } from '@composables/base/useBaseComponent'

export function useBaseQrCode(props: BaseQrCodeProps) {
	const matrix = computed(() => encodeQr(props.value, props.errorCorrection ?? 'M'))
	const margin = computed(() => Math.max(0, Math.round(props.margin ?? 4)))
	const viewSize = computed(() => (matrix.value?.size ?? 0) + margin.value * 2)
	const path = computed(() => (matrix.value ? qrPath(matrix.value.modules, margin.value) : ''))
	const colors = computed(() => ({ module: props.moduleColor ?? '#000000', background: props.backgroundColor ?? '#ffffff' }))
	return {
		...useStandardBaseComponent('base-qr-code', props, ['root']),
		matrix,
		viewSize,
		path,
		colors,
		accessibleLabel: computed(() => {
			if (!matrix.value) return UI_QR_CODE.TOO_LONG
			return props.label ?? formatMessage(UI_QR_CODE.LABEL, { value: props.value })
		}),
		getSvg(): string {
			if (!matrix.value) return ''
			const size = viewSize.value
			return [
				`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">`,
				`<rect width="${size}" height="${size}" fill="${colors.value.background}"/>`,
				`<path d="${path.value}" fill="${colors.value.module}"/>`,
				'</svg>',
			].join('')
		},
	}
}
