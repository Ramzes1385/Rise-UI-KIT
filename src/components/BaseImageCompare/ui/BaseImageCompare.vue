<template>
	<div
		ref="rootRef"
		class="base-image-compare"
		:class="[variantClass, classes.root, { 'base-image-compare--dragging': isDragging }]"
		:style="[sizeScaleStyle, { '--compare-position': `${position}%` }]"
		@pointerdown="handlePointerDown">
		<img class="base-image-compare__image" :src="after" :alt="afterAlt" draggable="false" />
		<div class="base-image-compare__before">
			<img class="base-image-compare__image" :src="before" :alt="beforeAlt" draggable="false" />
		</div>
		<span class="base-image-compare__label base-image-compare__label--before" aria-hidden="true">{{ beforeText }}</span>
		<span class="base-image-compare__label base-image-compare__label--after" aria-hidden="true">{{ afterText }}</span>
		<div class="base-image-compare__divider" aria-hidden="true" />
		<div
			class="base-image-compare__handle"
			:class="classes.handle"
			role="slider"
			tabindex="0"
			:aria-label="handleLabel"
			aria-valuemin="0"
			aria-valuemax="100"
			:aria-valuenow="position"
			:aria-valuetext="`${Math.round(position)}%`"
			aria-orientation="horizontal"
			@keydown="handleKeydown">
			<BaseIcon name="chevron-left" />
			<BaseIcon name="chevron-right" />
		</div>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseImageCompare.style.scss'
import { BaseIcon } from '@components/BaseIcon'
import { useBaseImageCompare } from '../model/useBaseImageCompare'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseImageCompareEmits, BaseImageCompareProps } from '../types/BaseImageCompare.types'

const props = withDefaults(defineProps<BaseImageCompareProps>(), {
	beforeLabel: undefined,
	afterLabel: undefined,
	position: 50,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<BaseImageCompareEmits>()

const {
	sizeScaleStyle,
	variantClass,
	classes,
	rootRef,
	position,
	isDragging,
	beforeText,
	afterText,
	handleLabel,
	handlePointerDown,
	handleKeydown,
} = useBaseImageCompare(props, emit)
</script>
