<template>
	<div
		class="base-range__thumb"
		:class="[{ 'base-range__thumb--custom': hasCustom }, thumbClass]"
		tabindex="0"
		role="slider"
		:aria-valuenow="value"
		:aria-valuemin="boundMin"
		:aria-valuemax="boundMax"
		@mousedown.stop.prevent="emitDown($event)"
		@touchstart.stop.prevent="emitDown($event)"
		@keydown="emitKeydown($event)">
		<slot :value="value" :index="index">
			<span class="base-range__thumb-dot" :class="dotClass"></span>
		</slot>
	</div>
</template>

<script setup lang="ts">
import type { BaseRangeThumbEmits, BaseRangeThumbProps, BaseRangeThumbSlots } from '../../model/BaseRangeThumb.types'

const props = defineProps<BaseRangeThumbProps>()
const emit = defineEmits<BaseRangeThumbEmits>()
defineSlots<BaseRangeThumbSlots>()

/** Начало перетаскивания ползунка */
function emitDown(event: MouseEvent | TouchEvent): void {
	emit('down', { event, index: props.index })
}

/** Клавиатурное управление ползунком */
function emitKeydown(event: KeyboardEvent): void {
	emit('keydown', { event, index: props.index })
}
</script>
