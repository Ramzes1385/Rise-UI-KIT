<template>
	<div
		ref="rootRef"
		class="base-splitter"
		:class="[
			variantClass,
			`base-splitter--${orientation}`,
			{ 'base-splitter--dragging': isDragging, 'base-splitter--disabled': isDisabled },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle, { '--base-splitter-ratio': String(size / 100) }]">
		<div
			:id="startId"
			ref="startRef"
			class="base-splitter__pane base-splitter__pane--start"
			:class="classes.pane"
			:tabindex="isStartScrollable ? 0 : undefined">
			<slot name="start" />
		</div>
		<div
			class="base-splitter__separator"
			:class="classes.separator"
			role="separator"
			:tabindex="isDisabled ? undefined : 0"
			:aria-label="label ?? UI_ARIA.SPLITTER"
			:aria-orientation="orientation === 'horizontal' ? 'vertical' : 'horizontal'"
			:aria-valuenow="Math.round(size)"
			:aria-valuemin="min"
			:aria-valuemax="max"
			:aria-controls="startId"
			:aria-disabled="isDisabled ? 'true' : undefined"
			@keydown="handleKeydown"
			@pointerdown="handlePointerdown"
			@pointermove="handlePointermove"
			@pointerup="handlePointerup"
			@pointercancel="handlePointerup">
			<span class="base-splitter__handle" aria-hidden="true" />
		</div>
		<div
			ref="endRef"
			class="base-splitter__pane base-splitter__pane--end"
			:class="classes.pane"
			:tabindex="isEndScrollable ? 0 : undefined">
			<slot name="end" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSplitter.style.scss'
import { UI_ARIA } from '@/locales/messages'
import { kitDefaults } from '@composables/useDefaults'
import { useBaseSplitter } from '../model/useBaseSplitter'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import type { BaseSplitterEmits, BaseSplitterProps, BaseSplitterSlots } from '../types/BaseSplitter.types'

const props = withDefaults(
	defineProps<BaseSplitterProps>(),
	kitDefaults('BaseSplitter', {
		variant: DEFAULT_VARIANT,
		modelValue: 50,
		orientation: 'horizontal',
		min: 10,
		max: 90,
		step: 5,
		isDisabled: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)

const emit = defineEmits<BaseSplitterEmits>()
defineSlots<BaseSplitterSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	classes,
	startId,
	rootRef,
	startRef,
	endRef,
	isStartScrollable,
	isEndScrollable,
	size,
	isDragging,
	handleKeydown,
	handlePointerdown,
	handlePointermove,
	handlePointerup,
} = useBaseSplitter(props, emit)
</script>
