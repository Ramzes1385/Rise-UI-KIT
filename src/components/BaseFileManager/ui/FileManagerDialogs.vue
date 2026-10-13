<template>
	<BaseConfirm
		:is-open="isDeleteOpen"
		:title="deleteTitle"
		:description="deleteDescription"
		:confirm-label="UI_FILE_MANAGER.DELETE"
		is-danger
		:size-scale="sizeScale"
		@close="closeDelete" />

	<BaseModal :is-open="isMoveOpen" :title="UI_FILE_MANAGER.MOVE_TITLE" :size-scale="sizeScale" @close="closeMove(false)">
		<p class="base-file-manager__hint">{{ UI_FILE_MANAGER.MOVE_HINT }}</p>
		<BaseTree
			:items="moveNodes"
			selection-mode="single"
			variant="ghost"
			is-default-expand-all
			:selected-ids="moveSelectedIds"
			:aria-label="UI_FILE_MANAGER.MOVE_TREE_LABEL"
			:size-scale="sizeScale"
			@update:selected-ids="setMoveTarget" />
		<template #footer>
			<BaseButton variant="outline" :size-scale="sizeScale" @click="closeMove(false)">{{ UI_TEXT.CANCEL }}</BaseButton>
			<BaseButton :size-scale="sizeScale" :is-disabled="!canSubmitMove" @click="closeMove(true)">
				{{ UI_FILE_MANAGER.MOVE_SUBMIT }}
			</BaseButton>
		</template>
	</BaseModal>

	<BaseModal :is-open="isUploadOpen" :title="UI_FILE_MANAGER.UPLOAD_TITLE" :size-scale="sizeScale" @close="closeUpload">
		<BaseFileUpload
			:key="uploadKey"
			is-multiple
			:accept="accept"
			:max-size="maxSize"
			:size-scale="sizeScale"
			@change="setUploadFiles" />
		<template #footer>
			<BaseButton variant="outline" :size-scale="sizeScale" @click="closeUpload">{{ UI_TEXT.CANCEL }}</BaseButton>
			<BaseButton :size-scale="sizeScale" :is-disabled="!uploadFiles.length" @click="submitUpload">
				{{ UI_FILE_MANAGER.UPLOAD_SUBMIT }}
			</BaseButton>
		</template>
	</BaseModal>
</template>

<script setup lang="ts">
import { BaseTree } from '@components/BaseTree'
import { BaseModal } from '@components/BaseModal'
import { BaseButton } from '@components/BaseButton'
import { BaseConfirm } from '@components/BaseConfirm'
import { BaseFileUpload } from '@components/BaseFileUpload'
import { UI_FILE_MANAGER, UI_TEXT } from '@/locales/messages'
import { useFileManagerContext } from '../model/useBaseFileManager'

const {
	sizeScale,
	accept,
	maxSize,
	dialogs: {
		isDeleteOpen,
		deleteTitle,
		deleteDescription,
		closeDelete,
		isMoveOpen,
		moveNodes,
		moveSelectedIds,
		canSubmitMove,
		setMoveTarget,
		closeMove,
		isUploadOpen,
		uploadKey,
		uploadFiles,
		setUploadFiles,
		submitUpload,
		closeUpload,
	},
} = useFileManagerContext()
</script>
