<template>
	<div class="base-table__resizer" @mousedown.stop="emit('resize-start', $event)" @click.stop></div>
</template>

<script setup lang="ts">
import type { BaseTableResizeHandleEmits } from '../types/BaseTableResizeHandle.types'

const emit = defineEmits<BaseTableResizeHandleEmits>()
</script>
