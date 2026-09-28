<template>
	<div
		class="base-range__thumb"
		:class="[{ 'base-range__thumb--custom': hasCustom }, thumbClass]"
		:tabindex="isDisabled ? -1 : 0"
		role="slider"
		:aria-label="label"
		:aria-valuenow="value"
		:aria-valuemin="boundMin"
		:aria-valuemax="boundMax"
		:aria-orientation="isVertical ? 'vertical' : undefined"
		:aria-disabled="isDisabled ? 'true' : undefined"
		@mousedown.stop.prevent="emitDown($event)"
		@touchstart.stop.prevent="emitDown($event)"
		@keydown="emitKeydown($event)">
		<slot :value="value" :index="index">
			<span class="base-range__thumb-dot" :class="dotClass"></span>
		</slot>
	</div>
</template>

<script setup lang="ts">
import { useBaseRangeThumb } from '../../model/useBaseRangeThumb'
import type { BaseRangeThumbEmits, BaseRangeThumbProps, BaseRangeThumbSlots } from '../../types/BaseRangeThumb.types'

const props = defineProps<BaseRangeThumbProps>()
const emit = defineEmits<BaseRangeThumbEmits>()
defineSlots<BaseRangeThumbSlots>()

const { emitDown, emitKeydown } = useBaseRangeThumb(props, emit)
</script>
