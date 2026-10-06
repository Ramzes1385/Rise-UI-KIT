<template>
	<div
		ref="rootRef"
		:class="[
			ui('root'),
			variantClass,
			{ 'base-waveform--disabled': isDisabled, 'base-waveform--selectable': isSelectable && !isDisabled },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		role="slider"
		:tabindex="isDisabled ? -1 : 0"
		:aria-label="label"
		aria-valuemin="0"
		:aria-valuemax="Math.round(duration)"
		:aria-valuenow="valueNow"
		:aria-valuetext="valueText"
		:aria-disabled="isDisabled || undefined"
		:aria-describedby="selection ? selectionId : undefined"
		@pointerdown="onPointerDown"
		@pointermove="onPointerMove"
		@pointerup="onPointerUp"
		@pointercancel="onPointerCancel"
		@keydown="onKeydown">
		<span
			v-for="(bar, index) in bars"
			:key="index"
			:class="[ui('bar'), { 'base-waveform__bar--played': bar.isPlayed }, classes.bar]"
			:style="{ transform: bar.scale }"
			aria-hidden="true"></span>
		<span v-if="selection" :class="[ui('selection'), classes.selection]" :style="selectionStyle" aria-hidden="true"></span>
		<span v-if="selection" :id="selectionId" :class="ui('hint')">{{ selectionText }}</span>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseWaveform.style.scss'
import { useBaseWaveform } from '../model/useBaseWaveform'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseWaveformEmits, BaseWaveformProps } from '../types/BaseWaveform.types'

const props = withDefaults(defineProps<BaseWaveformProps>(), {
	sizeScale: SIZE_SCALE_DEFAULT,
	currentTime: 0,
	selection: null,
	step: 5,
})

const emit = defineEmits<BaseWaveformEmits>()

const {
	rootRef,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	ui,
	bars,
	selectionStyle,
	valueText,
	selectionText,
	selectionId,
	valueNow,
	onPointerDown,
	onPointerMove,
	onPointerUp,
	onPointerCancel,
	onKeydown,
} = useBaseWaveform(props, emit)
</script>
