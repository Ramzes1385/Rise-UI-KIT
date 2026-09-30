<template>
	<div
		class="base-qr-code"
		:class="[variantClass, classes.root, { 'base-qr-code--overflow': !parts }]"
		:style="[sizeScaleStyle, { '--qr-size': `${size}px`, '--qr-background': background }]"
		role="img"
		:aria-label="accessibleLabel">
		<svg v-if="parts" class="base-qr-code__svg" :viewBox="`0 0 ${parts.viewSize} ${parts.viewSize}`" aria-hidden="true">
			<rect :width="parts.viewSize" :height="parts.viewSize" :fill="parts.colors.background" shape-rendering="crispEdges" />
			<path
				class="base-qr-code__modules"
				:d="parts.modules"
				:fill="parts.colors.module"
				:shape-rendering="parts.crisp.modules ? 'crispEdges' : undefined" />
			<path
				class="base-qr-code__finder"
				:d="parts.finder"
				:fill="parts.colors.finder"
				fill-rule="evenodd"
				:shape-rendering="parts.crisp.finder ? 'crispEdges' : undefined" />
			<image
				v-if="parts.logo"
				class="base-qr-code__logo"
				:href="parts.logo.href"
				:x="parts.logo.x"
				:y="parts.logo.y"
				:width="parts.logo.size"
				:height="parts.logo.size"
				preserveAspectRatio="xMidYMid meet" />
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
	errorCorrection: undefined,
	size: 160,
	margin: 4,
	moduleColor: undefined,
	backgroundColor: undefined,
	moduleShape: 'square',
	finderShape: 'square',
	finderColor: undefined,
	logo: undefined,
	logoSize: 0.22,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, classes, parts, background, accessibleLabel, getSvg } = useBaseQrCode(props)

defineExpose<BaseQrCodeExpose>({ getSvg })
</script>
