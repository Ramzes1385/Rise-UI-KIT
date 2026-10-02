<template>
	<div
		ref="handleRef"
		class="base-table__resizer"
		role="separator"
		tabindex="0"
		aria-orientation="vertical"
		:aria-label="`${TABLE_TEXT.RESIZE_COLUMN}: ${column.label}`"
		:aria-valuenow="width"
		:aria-valuemin="minWidth"
		@mousedown.stop="emit('resize-start', $event)"
		@click.stop
		@keydown="onKeydown"></div>
</template>

<script setup lang="ts">
import { TABLE_TEXT } from '@/locales/messages'
import { useBaseTableResizeHandle } from '../../model/useBaseTableResizeHandle'
import type { BaseTableResizeHandleEmits, BaseTableResizeHandleProps } from '../../types/header/BaseTableResizeHandle.types'

const props = defineProps<BaseTableResizeHandleProps>()

const emit = defineEmits<BaseTableResizeHandleEmits>()

const { handleRef, width, minWidth, onKeydown } = useBaseTableResizeHandle(props, emit)
</script>
