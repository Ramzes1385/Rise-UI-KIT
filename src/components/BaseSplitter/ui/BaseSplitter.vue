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
		:style="[sizeScaleStyle, variantStyle, rootStyle]">
		<template v-for="(pane, index) in panes" :key="pane.id">
			<BaseSplitterPane :id="pane.id" class="base-splitter__pane" :class="[pane.modifier, classes.pane]" :style="pane.style">
				<slot :name="pane.slot" />
			</BaseSplitterPane>
			<div
				v-if="separators[index]"
				v-bind="separators[index]"
				class="base-splitter__separator"
				:class="classes.separator"
				role="separator"
				:tabindex="isDisabled ? undefined : 0"
				:aria-orientation="orientation === 'horizontal' ? 'vertical' : 'horizontal'"
				:aria-disabled="isDisabled ? 'true' : undefined"
				@keydown="handleKeydown($event, index)"
				@pointerdown="handlePointerdown($event, index)"
				@pointermove="handlePointermove"
				@pointerup="handlePointerup"
				@pointercancel="handlePointerup">
				<span class="base-splitter__handle" aria-hidden="true" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseSplitter.style.scss'
import BaseSplitterPane from './BaseSplitterPane.vue'
import { useBaseSplitter } from '../model/useBaseSplitter'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
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
	rootRef,
	panes,
	separators,
	rootStyle,
	isDragging,
	handleKeydown,
	handlePointerdown,
	handlePointermove,
	handlePointerup,
} = useBaseSplitter(props, emit)
</script>
