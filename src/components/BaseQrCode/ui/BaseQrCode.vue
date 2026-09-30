<template>
	<div
		class="base-qr-code"
		:class="[variantClass, classes.root, { 'base-qr-code--overflow': !matrix }]"
		:style="[sizeScaleStyle, { '--qr-size': `${size}px`, '--qr-background': colors.background }]"
		role="img"
		:aria-label="accessibleLabel">
		<svg
			v-if="matrix"
			class="base-qr-code__svg"
			:viewBox="`0 0 ${viewSize} ${viewSize}`"
			shape-rendering="crispEdges"
			aria-hidden="true">
			<rect :width="viewSize" :height="viewSize" :fill="colors.background" />
			<path :d="path" :fill="colors.module" />
		</svg>
		<span v-else class="base-qr-code__message" aria-hidden="true">{{ UI_QR_CODE.TOO_LONG }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseQrCode.style.scss'
import { UI_QR_CODE } from '@/locales/messages'
import { useBaseQrCode } from '../model/useBaseQrCode'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseQrCodeExpose, BaseQrCodeProps } from '../types/BaseQrCode.types'

const props = withDefaults(defineProps<BaseQrCodeProps>(), {
	variant: 'default',
	label: undefined,
	errorCorrection: 'M',
	size: 160,
	margin: 4,
	moduleColor: undefined,
	backgroundColor: undefined,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, classes, matrix, viewSize, path, colors, accessibleLabel, getSvg } = useBaseQrCode(props)

defineExpose<BaseQrCodeExpose>({ getSvg })
</script>
