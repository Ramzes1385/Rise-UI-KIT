<template>
	<!--
		Область прокрутки с тонкими полосами поверх содержимого: одинаковый вид во всех системах. Прокручивает родной
		элемент (колесо, касание, клавиатура работают как обычно), полосы — только для мыши (aria-hidden). Область
		с прокруткой получает tabindex="0", чтобы её можно было прокрутить стрелками
	-->
	<div
		class="base-scroll-area"
		:class="[
			variantClass,
			`base-scroll-area--${orientation}`,
			`base-scroll-area--scrollbar-${scrollbar}`,
			{ 'base-scroll-area--active': isScrolling || dragAxis !== null },
			classes.root,
		]"
		:style="[sizeScaleStyle, variantStyle]">
		<div
			ref="viewportRef"
			class="base-scroll-area__viewport"
			:class="classes.viewport"
			:style="viewportStyle"
			:tabindex="isScrollable ? 0 : undefined"
			:role="ariaLabel ? 'region' : undefined"
			:aria-label="ariaLabel"
			@scroll="handleScroll">
			<div ref="contentRef" class="base-scroll-area__content">
				<slot />
			</div>
		</div>
		<template v-for="axis in axes" :key="axis">
			<div
				v-if="bars[axis].isVisible"
				class="base-scroll-area__bar"
				:class="[`base-scroll-area__bar--${axis}`, classes.bar]"
				aria-hidden="true"
				@pointerdown="handleTrackPointerdown(axis, $event)">
				<div
					class="base-scroll-area__thumb"
					:class="classes.thumb"
					:style="thumbStyle(axis)"
					@pointerdown.stop="handleThumbPointerdown(axis, $event)"
					@pointermove="handleThumbPointermove"
					@pointerup="handleThumbPointerup"
					@pointercancel="handleThumbPointerup" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { kitDefaults } from '@composables/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/useBaseComponent'
import { useBaseScrollArea } from '../model/useBaseScrollArea'
import '../styles/BaseScrollArea.style.scss'
import type { BaseScrollAreaEmits, BaseScrollAreaExpose, BaseScrollAreaProps, BaseScrollAreaSlots } from '../types/BaseScrollArea.types'

const props = withDefaults(
	defineProps<BaseScrollAreaProps>(),
	kitDefaults('BaseScrollArea', {
		variant: DEFAULT_VARIANT,
		orientation: 'vertical',
		scrollbar: 'hover',
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseScrollAreaEmits>()
defineSlots<BaseScrollAreaSlots>()

const {
	sizeScaleStyle,
	variantClass,
	variantStyle,
	classes,
	axes,
	viewportRef,
	contentRef,
	viewportStyle,
	bars,
	isScrollable,
	thumbStyle,
	isScrolling,
	handleScroll,
	handleTrackPointerdown,
	dragAxis,
	handleThumbPointerdown,
	handleThumbPointermove,
	handleThumbPointerup,
	exposed,
} = useBaseScrollArea(props, emit)

defineExpose<BaseScrollAreaExpose>(exposed)
</script>
