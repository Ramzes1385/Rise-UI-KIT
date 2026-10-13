<template>
	<div
		ref="handleRef"
		:class="ui('resizer')"
		role="separator"
		tabindex="0"
		aria-orientation="vertical"
		:aria-label="`${TABLE_TEXT.RESIZE_COLUMN}: ${column.label}`"
		:aria-valuenow="width"
		:aria-valuemin="minWidth"
		:aria-valuemax="maxWidth"
		:aria-valuetext="`${width}px`"
		@pointerdown.stop="onPointerdown"
		@click.stop
		@keydown="onKeydown"></div>
</template>

<script setup lang="ts">
import { TABLE_TEXT } from '@/locales/messages'
import { useBaseTableResizeHandle } from '../../model/header/useBaseTableResizeHandle'
import type { BaseTableResizeHandleEmits, BaseTableResizeHandleProps } from '../../types/header/BaseTableResizeHandle.types'

const props = defineProps<BaseTableResizeHandleProps>()

const emit = defineEmits<BaseTableResizeHandleEmits>()

const { ui, handleRef, width, minWidth, maxWidth, onKeydown, onPointerdown } = useBaseTableResizeHandle(props, emit)
</script>
