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
			:class-name="ui('label')"
			:custom-class="classes.label"
			:size-scale="sizeScale"
			@click="focusContent" />

		<div :class="ui('frame')">
			<BaseEditorToolbar
				:active-states="activeStates"
				:size-scale="sizeScale"
				:classes="classes"
				:ui="props.ui"
				:is-code-mode="isCodeMode"
				:is-readonly="isLocked"
				:is-media-selected="Boolean(selectedMedia)"
				:has-toolbar="hasToolbar"
				:heading-options="headingOptions"
				:text-color="textColor"
				:background-color="backgroundColor"
				:is-text-color-active="isTextColorActive"
				:is-background-color-active="isBackgroundColorActive"
				@apply-format="applyFormat"
				@apply-block="applyBlock"
				@handle-heading-change="handleHeadingChange"
				@insert-link="insertLink"
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
					<slot name="toolbar" />
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
				@paste="handlePaste"
				@dragstart="isInternalDrag = true"
				@dragend="isInternalDrag = false"
				@drop="handleDrop"
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
				:size-scale="sizeScale"
				@update:model-value="handleCodeInput"
				@focus="handleFocus"
				@blur="handleBlur" />
		</div>

		<FormFieldError
			:id="errorId"
			:error="error ?? ''"
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
				<div class="base-editor__context-menu-row" @keydown.enter.prevent="applyMediaSize">
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
		variant: DEFAULT_VARIANT,
		hasToolbar: true,
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
	contentId,
	labelledBy,
	focusContent,
	editorRef,
	codeTextareaRef,
	menuControlScale,
	headingOptions,
	activeStates,
	contextMenu,
	contextMenuRef,
	mediaMenuAnchor,
	closeContextMenu,
	isCodeMode,
	codeContent,
	applyFormat,
	applyBlock,
	handleHeadingChange,
	insertLink,
	clearAllFormatting,
	insertSeparator,
	toggleCodeMode,
	handleCodeInput,
	handleContextMenu,
	applyMediaSize,
	removeMedia,
	saveSelection,
	handleKeyDown,
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
	handlePaste,
	handleDrop,
	handleFocus,
	handleBlur,
} = useBaseEditor(props, emit)
</script>
