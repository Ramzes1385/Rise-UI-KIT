<template>
	<div
		:class="[ui('root'), variantClass, classes.root, { 'base-qr-code--overflow': !view, 'base-qr-code--concealed': isHidden }]"
		:style="[sizeScaleStyle, { '--qr-size': `${size}px`, '--qr-background': background }]">
		<div
			ref="boxRef"
			:class="ui('box')"
			:role="isHidden ? undefined : 'img'"
			:aria-label="isHidden ? undefined : accessibleLabel"
			:tabindex="isConcealed ? -1 : undefined">
			<svg v-if="view" :class="ui('svg')" :viewBox="`0 0 ${view.viewSize} ${view.viewSize}`" aria-hidden="true">
				<rect :width="view.viewSize" :height="view.viewSize" :fill="view.colors.background" shape-rendering="crispEdges" />
				<path
					:class="ui('modules')"
					:d="view.modules"
					:fill="view.colors.module"
					:shape-rendering="view.crisp.modules ? 'crispEdges' : undefined" />
				<path
					:class="ui('finder')"
					:d="view.finder"
					:fill="view.colors.finder"
					fill-rule="evenodd"
					:shape-rendering="view.crisp.finder ? 'crispEdges' : undefined" />
				<image
					v-if="view.logo"
					:class="ui('logo')"
					:href="view.logo.href"
					:x="view.logo.x"
					:y="view.logo.y"
					:width="view.logo.size"
					:height="view.logo.size"
					preserveAspectRatio="xMidYMid meet" />
			</svg>
			<span v-else :class="ui('message')" aria-hidden="true">{{ UI_QR_CODE.TOO_LONG }}</span>
			<BaseButton v-if="isHidden" :class="ui('reveal')" :size-scale="sizeScale" @click="revealByButton">
				{{ UI_QR_CODE.REVEAL }}
			</BaseButton>
		</div>
		<span v-if="caption" :class="ui('caption')">{{ caption }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseQrCode.style.scss'
import { UI_QR_CODE } from '@/locales/messages'
import { BaseButton } from '@components/BaseButton'
import { useBaseQrCode } from '../model/useBaseQrCode'
import { kitDefaults } from '@composables/base/useDefaults'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseQrCodeEmits, BaseQrCodeExpose, BaseQrCodeProps } from '../types/BaseQrCode.types'

const props = withDefaults(
	defineProps<BaseQrCodeProps>(),
	kitDefaults('BaseQrCode', {
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
		isConcealed: false,
		revealTimeout: 0,
		showValue: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseQrCodeEmits>()

const { ui, sizeScaleStyle, variantClass, classes, view, isHidden, revealByButton, background, caption, accessibleLabel, exposed } =
	useBaseQrCode(props, emit)

defineExpose<BaseQrCodeExpose>(exposed)
</script>
