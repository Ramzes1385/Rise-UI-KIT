<template>
	<div ref="rootRef" :class="ui('editor')" @keydown="handleKeydown" @focusout="handleFocusOut">
		<BaseTextarea
			ref="fieldRef"
			:class="ui('field')"
			:model-value="text"
			:aria-label="label"
			:rows="2"
			is-autosize
			:size-scale="sizeScale"
			@update:model-value="handleInput" />
		<div v-if="submitLabel" class="base-kanban__editor-actions">
			<BaseButton :size-scale="sizeScale" @mousedown.prevent @click="submit">{{ submitLabel }}</BaseButton>
			<BaseButton variant="ghost" :size-scale="sizeScale" :aria-label="UI_KANBAN.CANCEL" @mousedown.prevent @click="cancel">
				<BaseIcon name="x-mark" :size-scale="calcIconScale('md', sizeScale)" />
			</BaseButton>
		</div>
	</div>
</template>

<script setup lang="ts">
import { UI_KANBAN } from '@/locales/messages'
import { BaseIcon } from '@components/BaseIcon'
import { BaseButton } from '@components/BaseButton'
import { calcIconScale } from '@utils/media/iconUtils'
import { BaseTextarea } from '@components/BaseTextarea'
import { useKanbanTextEditor } from '../model/edit/useKanbanTextEditor'
import { SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { KanbanTextEditorEmits, KanbanTextEditorProps } from '../types/KanbanParts.types'

const props = withDefaults(defineProps<KanbanTextEditorProps>(), {
	submitLabel: undefined,
	isRepeating: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const emit = defineEmits<KanbanTextEditorEmits>()

const { rootRef, fieldRef, text, submit, cancel, handleInput, handleKeydown, handleFocusOut } = useKanbanTextEditor(props, emit)
</script>
