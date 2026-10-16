<template>
	<div
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			ui('root'),
			{
				'base-editor--readonly': isReadonly,
				'base-editor--disabled': isDisabled,
				'base-editor--error': control.hasError.value,
				'base-editor--focused': isFocused,
				'base-editor--code-mode': isCodeMode,
			},
			variantClass,
			classes.root,
		]">
		<FormFieldLabel
			v-if="label"
			:id="labelId"
			tag="span"
			:label="label"
			:is-required="isRequired"
			:class-name="ui('label')"
			:custom-class="classes.label"
			:required-class-name="ui('required')"
			:required-custom-class="classes.required"
			:size-scale="sizeScale"
			@click="focusContent" />

		<div :class="ui('frame')" :aria-busy="isUploading ? 'true' : undefined">
			<BaseEditorToolbar
				:active-states="activeStates"
				:size-scale="sizeScale"
				:classes="classes"
				:ui="props.ui"
				:is-code-mode="isCodeMode"
				:is-readonly="isLocked"
				:is-media-selected="Boolean(selectedMedia)"
				:has-toolbar="hasToolbar"
				:has-history-buttons="hasHistoryButtons"
				:can-undo="history.canUndo.value"
				:can-redo="history.canRedo.value"
				:heading-options="headingOptions"
				:text-color="textColor"
				:background-color="backgroundColor"
				:is-text-color-active="isTextColorActive"
				:is-background-color-active="isBackgroundColorActive"
				@undo="history.undo"
				@redo="history.redo"
				@apply-format="applyFormat"
				@apply-block="applyBlock"
				@handle-heading-change="handleHeadingChange"
				@insert-link="openLinkDialog"
				@handle-image-upload="handleImageUpload"
				@handle-video-upload="handleVideoUpload"
				@clear-all-formatting="clearAllFormatting"
				@insert-separator="insertSeparator"
				@open-media-menu="openSelectedMediaMenu"
				@toggle-code-mode="toggleCodeMode"
				@save-selection="saveSelection"
				@handle-text-color="handleTextColor"
				@handle-background-color="handleBackgroundColor"
				@reset-text-color="resetTextColor"
				@reset-background-color="resetBackgroundColor">
				<template v-if="$slots.toolbar" #toolbar>
					<slot name="toolbar" v-bind="toolbarSlotProps" />
				</template>
			</BaseEditorToolbar>

			<div
				v-if="!isCodeMode"
				ref="editorRef"
				:class="[ui('content'), { 'base-editor__content--empty': isEmpty }, classes.content]"
				:contenteditable="!isLocked"
				:id="contentId"
				v-bind="control.aria.value"
				role="textbox"
				aria-multiline="true"
				:tabindex="isReadonly && !isDisabled ? 0 : undefined"
				:aria-label="labelledBy ? undefined : UI_EDITOR.CONTENT_LABEL"
				:aria-labelledby="labelledBy"
				:aria-readonly="isReadonly ? 'true' : undefined"
				:aria-disabled="isDisabled ? 'true' : undefined"
				:aria-placeholder="placeholder || undefined"
				:data-placeholder="placeholder"
				@input="handleInput"
				@copy="handleCopy"
				@cut="handleCut"
				@compositionstart="handleCompositionStart"
				@compositionend="handleCompositionEnd"
				@beforeinput="handleBeforeInput"
				@drop="handleDrop"
				@dragstart="isInternalDrag = true"
				@dragend="isInternalDrag = false"
				@focus="handleFocus"
				@blur="handleBlur"
				@mouseup="saveSelection"
				@keyup="saveSelection"
				@keydown="handleKeyDown"
				@contextmenu="handleContextMenu"></div>

			<BaseTextarea
				v-if="isCodeMode"
				ref="codeTextareaRef"
				:class="ui('code')"
				:custom-class="classes.code"
				:label="UI_EDITOR.CODE_LABEL"
				is-autosize
				:model-value="codeContent"
				:placeholder="placeholder"
				:is-readonly="isLocked"
				:size-scale="sizeScale"
				@compositionstart="handleCompositionStart"
				@compositionend="handleCompositionEnd"
				@update:model-value="handleCodeInput"
				@focus="handleFocus"
				@blur="handleBlur" />
		</div>

		<span v-if="uploadError" role="alert" class="base-editor__upload-error">{{ uploadError }}</span>

		<input v-if="name" type="hidden" :name="name" :value="formValue" :disabled="isDisabled" />

		<FormFieldError
			:id="errorId"
			:error="formField.error"
			:class-name="ui('error-text')"
			:custom-class="classes.errorText"
			:size-scale="sizeScale" />

		<BasePopover
			:is-open="contextMenu.isVisible"
			:anchor="mediaMenuAnchor"
			position="bottom"
			variant="ghost"
			max-height="none"
			animation="fade"
			:size-scale="sizeScale"
			:aria-label="UI_EDITOR.MEDIA_MENU_LABEL"
			:ui="{ inner: ui('context-menu') }"
			@close="closeContextMenu">
			<div ref="contextMenuRef" class="base-editor__context-menu-body">
				<div class="base-editor__context-menu-row" @keydown.enter="handleMediaSizeEnter">
					<BaseInput
						:model-value="contextMenu.width"
						type="number"
						:label="UI_EDITOR.WIDTH"
						postfix="px"
						:size-scale="menuControlScale"
						@update:model-value="contextMenu.width = String($event)" />
					<BaseInput
						:model-value="contextMenu.height"
						type="number"
						:label="UI_EDITOR.HEIGHT"
						postfix="px"
						:size-scale="menuControlScale"
						@update:model-value="contextMenu.height = String($event)" />
				</div>
				<div class="base-editor__context-menu-actions">
					<BaseButton variant="ghost" :size-scale="menuControlScale" @click="removeMedia">{{ UI_EDITOR.DELETE }}</BaseButton>
					<BaseButton :size-scale="menuControlScale" @click="applyMediaSize">{{ UI_EDITOR.APPLY }}</BaseButton>
				</div>
			</div>
		</BasePopover>

		<BasePopover
			:is-open="linkDialog.isVisible"
			:anchor="linkDialogAnchor"
			position="bottom"
			variant="ghost"
			max-height="none"
			animation="fade"
			:size-scale="sizeScale"
			:aria-label="UI_EDITOR.LINK_DIALOG_LABEL"
			:ui="{ inner: ui('context-menu') }"
			@close="closeLinkDialog">
			<div ref="linkDialogRef" class="base-editor__link-dialog" @keydown.enter="handleLinkDialogEnter">
				<BaseInput
					:model-value="linkDialog.url"
					:label="UI_EDITOR.LINK_URL"
					:error="linkDialog.error"
					:input-attrs="{ inputmode: 'url', autocomplete: 'off' }"
					:size-scale="menuControlScale"
					@update:model-value="setLinkUrl" />
				<BaseCheckbox v-model="linkDialog.isNewTab" :label="UI_EDITOR.LINK_NEW_TAB" :size-scale="menuControlScale" />
				<div class="base-editor__context-menu-actions">
					<BaseButton v-if="linkDialog.hasLink" variant="ghost" :size-scale="menuControlScale" @click="removeLinkFromDialog">
						{{ UI_EDITOR.LINK_REMOVE }}
					</BaseButton>
					<BaseButton :size-scale="menuControlScale" @click="applyLinkDialog">{{ UI_EDITOR.APPLY }}</BaseButton>
				</div>
			</div>
		</BasePopover>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseEditor.style.scss'
import { UI_EDITOR } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { BasePopover } from '@components/BasePopover'
import { useBaseEditor } from '../model/useBaseEditor'
import BaseEditorToolbar from './BaseEditorToolbar.vue'
import { BaseCheckbox } from '@components/BaseCheckbox'
import { BaseTextarea } from '@components/BaseTextarea'
import { kitDefaults } from '@composables/base/useDefaults'
import { FormFieldError, FormFieldLabel } from '@components/BaseFormField'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseEditorEmits, BaseEditorProps, BaseEditorSlots } from '../types/BaseEditor.types'

const props = withDefaults(
	defineProps<BaseEditorProps>(),
	kitDefaults('BaseEditor', {
		modelValue: '',
		placeholder: '',
		isReadonly: false,
		isDisabled: false,
		isRequired: false,
		variant: DEFAULT_VARIANT,
		hasToolbar: true,
		hasHistoryButtons: true,
		isAutofocus: false,
		sizeScale: SIZE_SCALE_DEFAULT,
	}),
)
const emit = defineEmits<BaseEditorEmits>()
defineSlots<BaseEditorSlots>()

const {
	ui,
	sizeScaleStyle,
	variantClass,
	variantStyle,
	customColorStyle,
	classes,
	isLocked,
	isDisabled,
	selectedMedia,
	openSelectedMediaMenu,
	labelId,
	errorId,
	control,
	formField,
	exposed,
	uploadError,
	isUploading,
	toolbarSlotProps,
	formValue,
	handleCompositionStart,
	handleCompositionEnd,
	contentId,
	labelledBy,
	focusContent,
	editorRef,
	codeTextareaRef,
	menuControlScale,
	headingOptions,
	activeStates,
	history,
	contextMenu,
	contextMenuRef,
	mediaMenuAnchor,
	linkDialog,
	linkDialogRef,
	linkDialogAnchor,
	openLinkDialog,
	closeLinkDialog,
	applyLinkDialog,
	handleLinkDialogEnter,
	removeLinkFromDialog,
	setLinkUrl,
	closeContextMenu,
	isCodeMode,
	codeContent,
	applyFormat,
	applyBlock,
	handleHeadingChange,
	clearAllFormatting,
	insertSeparator,
	toggleCodeMode,
	handleCodeInput,
	handleContextMenu,
	applyMediaSize,
	handleMediaSizeEnter,
	removeMedia,
	saveSelection,
	handleKeyDown,
	handleCopy,
	handleCut,
	handleImageUpload,
	handleVideoUpload,
	isFocused,
	isEmpty,
	textColor,
	backgroundColor,
	isTextColorActive,
	isBackgroundColorActive,
	handleTextColor,
	handleBackgroundColor,
	resetTextColor,
	resetBackgroundColor,
	handleInput,
	isInternalDrag,
	handleBeforeInput,
	handleDrop,
	handleFocus,
	handleBlur,
} = useBaseEditor(props, emit)

defineExpose(exposed)
</script>
