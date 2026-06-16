<template>
	<Teleport to="body">
		<div
			v-if="isVisible"
			ref="contextMenuRef"
			class="base-editor__context-menu"
			:style="{ left: x + 'px', top: y + 'px' }">
			<div class="base-editor__context-menu-row">
				<BaseInput
					:model-value="width"
					type="number"
					placeholder="Ширина"
					:size-scale="80"
					@update:model-value="emit('update:width', String($event))" />
				<BaseInput
					:model-value="height"
					type="number"
					placeholder="Высота"
					:size-scale="80"
					@update:model-value="emit('update:height', String($event))" />
			</div>
			<div class="base-editor__context-menu-actions">
				<BaseButton :size-scale="80" @click="emit('applyMediaSize')">{{ UI_APPLY_TEXT }}</BaseButton>
				<BaseButton variant="ghost" :size-scale="80" @click="emit('removeMedia')">{{ UI_DELETE_TEXT }}</BaseButton>
			</div>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { BaseButton } from '@components/BaseButton'
import { BaseInput } from '@components/BaseInput'
import { UI_APPLY_TEXT, UI_DELETE_TEXT } from '@constants'
import { ref } from 'vue'

defineProps<{
	isVisible: boolean
	x: number
	y: number
	width: string
	height: string
}>()

const emit = defineEmits<{
	'update:width': [value: string]
	'update:height': [value: string]
	applyMediaSize: []
	removeMedia: []
}>()

const contextMenuRef = ref<HTMLElement | null>(null)

defineExpose({ contextMenuRef })
</script>
