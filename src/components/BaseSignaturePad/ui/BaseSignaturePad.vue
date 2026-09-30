<template>
	<div
		class="base-signature-pad"
		:class="[
			variantClass,
			classes.root,
			{ 'base-signature-pad--error': Boolean(error), 'base-signature-pad--disabled': isControlDisabled },
		]"
		:style="[
			sizeScaleStyle,
			variantStyle,
			customColorStyle,
			{ '--signature-width': `${width}px`, '--signature-ratio': `${width} / ${height}`, '--signature-pen': penColor },
		]"
		role="group"
		:aria-labelledby="labelledBy"
		:aria-label="labelledBy ? undefined : UI_SIGNATURE_PAD.LABEL"
		:aria-describedby="describedBy"
		:aria-disabled="isControlDisabled || undefined">
		<span v-if="label" :id="labelId" class="base-signature-pad__label" :class="classes.label">{{ label }}</span>
		<div class="base-signature-pad__surface" :class="classes.surface">
			<span class="base-signature-pad__baseline" aria-hidden="true">×</span>
			<span v-if="isEmpty" class="base-signature-pad__hint" aria-hidden="true">{{ placeholder ?? UI_SIGNATURE_PAD.HINT }}</span>
			<svg
				ref="surfaceRef"
				class="base-signature-pad__canvas"
				:viewBox="`0 0 ${width} ${height}`"
				role="img"
				:aria-label="inkLabel"
				@pointerdown="handlePointerDown">
				<path v-if="path" class="base-signature-pad__ink" :d="path" :stroke-width="lineWidth" />
			</svg>
		</div>
		<div class="base-signature-pad__toolbar" :class="classes.toolbar">
			<BaseButton variant="ghost" :size-scale="sizeScale * 0.875" :is-disabled="isEmpty || isControlDisabled" @click="undo">
				{{ UI_SIGNATURE_PAD.UNDO }}
			</BaseButton>
			<BaseButton variant="ghost" :size-scale="sizeScale * 0.875" :is-disabled="isEmpty || isControlDisabled" @click="clear">
				{{ UI_SIGNATURE_PAD.CLEAR }}
			</BaseButton>
		</div>
		<p v-if="error" :id="errorId" class="base-signature-pad__error" :class="classes.error">{{ error }}</p>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSignaturePad.style.scss'
import { BaseButton } from '@components/BaseButton'
import { UI_SIGNATURE_PAD } from '@/locales/messages'
import { useBaseSignaturePad } from '../model/useBaseSignaturePad'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseSignaturePadEmits, BaseSignaturePadExpose, BaseSignaturePadProps } from '../types/BaseSignaturePad.types'

const props = withDefaults(defineProps<BaseSignaturePadProps>(), {
	variant: 'default',
	modelValue: () => [],
	label: undefined,
	placeholder: undefined,
	width: 400,
	height: 160,
	penColor: undefined,
	lineWidth: 2.5,
	error: undefined,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseSignaturePadEmits>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	labelId,
	errorId,
	surfaceRef,
	labelledBy,
	describedBy,
	isControlDisabled,
	isEmpty,
	path,
	inkLabel,
	handlePointerDown,
	undo,
	clear,
	exposed,
} = useBaseSignaturePad(props, emit)

defineExpose<BaseSignaturePadExpose>(exposed)
</script>
