<template>
	<div role="group" :aria-label="editorLabel" :class="[ui('entry'), 'base-file-manager__entry--editing', classes.entry]">
		<span :class="[ui('icon'), classes.icon]">
			<BaseIcon :name="icon" :size-scale="sizeScale" />
		</span>
		<BaseInput
			:model-value="draft"
			:error="editorError"
			:aria-label="editorLabel"
			:size-scale="sizeScale"
			:class="[ui('editor'), classes.editor]"
			@update:model-value="setDraft"
			@keydown="handleEditorKeydown"
			@blur="finishEditing" />
	</div>
</template>

<script setup lang="ts">
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { useFileManagerContext } from '../model/useBaseFileManager'
import type { FileManagerEditorProps } from '../types/FileManagerInternal.types'

defineProps<FileManagerEditorProps>()

const {
	ui,
	classes,
	sizeScale,
	editor: { draft, editorError, editorLabel, setDraft, handleEditorKeydown, finishEditing },
} = useFileManagerContext()
</script>
