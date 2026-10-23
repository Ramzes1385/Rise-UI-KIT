<template>
	<div
		:class="[
			ui('root'),
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
		<FormFieldLabel
			v-if="label"
			:id="labelId"
			tag="span"
			:label="label"
			:class-name="ui('label')"
			:custom-class="classes.label"
			:size-scale="sizeScale" />
		<div :class="[ui('surface'), classes.surface]">
			<span :class="ui('baseline')" aria-hidden="true">×</span>
			<Transition name="base-signature-pad-fade">
				<span v-if="isEmpty" :class="ui('hint')" aria-hidden="true">{{ placeholder ?? UI_SIGNATURE_PAD.HINT }}</span>
			</Transition>
			<svg
				ref="surfaceRef"
				:class="ui('canvas')"
				:viewBox="`0 0 ${width} ${height}`"
				role="img"
				:aria-label="inkLabel"
				@pointerdown="handlePointerDown">
				<path v-if="path" :class="ui('ink')" :d="path" :stroke-width="lineWidth" />
			</svg>
		</div>
		<div :class="[ui('toolbar'), classes.toolbar]">
			<BaseButton
				variant="ghost"
				:size-scale="calcDerivedScale(sizeScale, 0.875)"
				:is-disabled="isEmpty || isControlDisabled"
				:is-focusable-when-disabled="!isControlDisabled"
				@click="undo">
				{{ UI_SIGNATURE_PAD.UNDO }}
			</BaseButton>
			<BaseButton
				variant="ghost"
				:size-scale="calcDerivedScale(sizeScale, 0.875)"
				:is-disabled="isEmpty || isControlDisabled"
				:is-focusable-when-disabled="!isControlDisabled"
				@click="clear">
				{{ UI_SIGNATURE_PAD.CLEAR }}
			</BaseButton>
		</div>
		<FormFieldError
			v-if="error"
			:id="errorId"
			:error="error"
			:class-name="ui('error')"
			:custom-class="classes.error"
			:size-scale="sizeScale" />
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSignaturePad.style.scss'
import { BaseButton } from '@components/BaseButton'
import { UI_SIGNATURE_PAD } from '@/locales/messages'
import { calcDerivedScale } from '@utils/media/iconUtils'
import { useBaseSignaturePad } from '../model/useBaseSignaturePad'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
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
	ui,
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
