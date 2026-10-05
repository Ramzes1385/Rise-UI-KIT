<template>
	<div
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			ui('root'),
			{
				'base-editor--readonly': isLocked,
				'base-editor--focused': isFocused,
				'base-editor--code-mode': isCodeMode,
			},
			variantClass,
			classes.root,
		]">
		<BaseEditorToolbar
			:active-states="activeStates"
			:size-scale="sizeScale"
			:classes="classes"
			:ui="props.ui"
			:is-code-mode="isCodeMode"
			:is-readonly="isLocked"
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
			role="textbox"
			aria-multiline="true"
			:aria-label="UI_EDITOR.CONTENT_LABEL"
			:aria-readonly="isLocked ? 'true' : undefined"
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

		<Teleport defer :to="teleportTarget">
			<div
				v-if="contextMenu.isVisible"
				ref="contextMenuRef"
				:class="ui('context-menu')"
				role="dialog"
				:aria-label="UI_EDITOR.MEDIA_MENU_LABEL"
				:style="[sizeScaleStyle, { left: contextMenu.x + 'px', top: contextMenu.y + 'px' }, layerStyle]"
				v-bind="inheritedTheme">
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
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import '../styles/BaseEditor.style.scss'
import { UI_EDITOR } from '@/locales/messages'
import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { useBaseEditor } from '../model/useBaseEditor'
import BaseEditorToolbar from './BaseEditorToolbar.vue'
import { BaseTextarea } from '@components/BaseTextarea'
import { kitDefaults } from '@composables/base/useDefaults'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT } from '@composables/base/useBaseComponent'
import type { BaseEditorEmits, BaseEditorProps, BaseEditorSlots } from '../types/BaseEditor.types'

const props = withDefaults(
	defineProps<BaseEditorProps>(),
	kitDefaults('BaseEditor', {
		modelValue: '',
		placeholder: '',
		isReadonly: false,
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
	teleportTarget,
	isLocked,
	editorRef,
	codeTextareaRef,
	menuControlScale,
	headingOptions,
	activeStates,
	contextMenu,
	contextMenuRef,
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
	inheritedTheme,
	layerStyle,
	handleFocus,
	handleBlur,
} = useBaseEditor(props, emit)
</script>
