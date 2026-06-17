<template>
	<div
		class="base-editor"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-editor--readonly': isReadonly,
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
			:is-code-mode="isCodeMode"
			:is-readonly="isReadonly"
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
			class="base-editor__content"
			:class="[{ 'base-editor__content--empty': isEmpty }, classes.content]"
			:contenteditable="!isReadonly"
			:data-placeholder="placeholder"
			@input="handleInput"
			@focus="handleFocus"
			@blur="handleBlur"
			@mouseup="saveSelection"
			@keyup="saveSelection"
			@keydown="handleKeyDown"
			@contextmenu="handleContextMenu"></div>

		<BaseTextarea
			v-if="isCodeMode"
			ref="codeTextareaRef"
			class="base-editor__code"
			:custom-class="classes.code"
			:model-value="codeContent"
			:placeholder="placeholder"
			:size-scale="sizeScale"
			@update:model-value="handleCodeInput"
			@focus="handleFocus"
			@blur="handleBlur" />

		<Teleport to="body">
			<div
				v-if="contextMenu.isVisible"
				ref="contextMenuRef"
				class="base-editor__context-menu"
				:style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }">
				<div class="base-editor__context-menu-row">
					<BaseInput
						:model-value="contextMenu.width"
						type="number"
						:placeholder="UI_EDITOR_WIDTH"
						:size-scale="80"
						@update:model-value="contextMenu.width = String($event)" />
					<BaseInput
						:model-value="contextMenu.height"
						type="number"
						:placeholder="UI_EDITOR_HEIGHT"
						:size-scale="80"
						@update:model-value="contextMenu.height = String($event)" />
				</div>
				<div class="base-editor__context-menu-actions">
					<BaseButton :size-scale="80" @click="applyMediaSize">{{ UI_EDITOR_APPLY }}</BaseButton>
					<BaseButton variant="ghost" :size-scale="80" @click="removeMedia">{{ UI_EDITOR_DELETE }}</BaseButton>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import '../styles/BaseEditor.style.scss'

import { BaseButton } from '@components/BaseButton'
import { BaseInput } from '@components/BaseInput'
import { BaseTextarea } from '@components/BaseTextarea'
import { useStandardBaseComponent } from '@composables/useBaseComponent'
import { useEditorToolbar } from '@composables/useEditorToolbar'
import { UI_EDITOR_APPLY, UI_EDITOR_DELETE, UI_EDITOR_HEADING_PREFIX, UI_EDITOR_HEIGHT, UI_EDITOR_PARAGRAPH, UI_EDITOR_URL_PROMPT, UI_EDITOR_WIDTH, SIZE_SCALE_DEFAULT, DEFAULT_VARIANT} from '@constants'
import { useEditorState } from '../composables/useEditorState'
import BaseEditorToolbar from './BaseEditorToolbar.vue'
import type { BaseEditorEmits, BaseEditorProps } from '../model/BaseEditor.types'
import type { BaseSelectOption } from '@components/BaseSelect'

const props = withDefaults(defineProps<BaseEditorProps>(), {
	modelValue: '',
	placeholder: '',
	isReadonly: false,
	variant: DEFAULT_VARIANT,
	hasToolbar: true,
	isAutofocus: false,
	sizeScale: SIZE_SCALE_DEFAULT,
})

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-editor', props, ['root', 'toolbar', 'btn', 'group', 'colorPicker', 'headingSelect', 'fileInput', 'content', 'code'])

const emit = defineEmits<BaseEditorEmits>()

const editorRef = ref<HTMLDivElement | null>(null)
const codeTextareaRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null)

const headingOptions: BaseSelectOption[] = [
	{ value: 'p', label: UI_EDITOR_PARAGRAPH },
	{ value: 'h1', label: `${UI_EDITOR_HEADING_PREFIX} 1` },
	{ value: 'h2', label: `${UI_EDITOR_HEADING_PREFIX} 2` },
	{ value: 'h3', label: `${UI_EDITOR_HEADING_PREFIX} 3` },
	{ value: 'h4', label: `${UI_EDITOR_HEADING_PREFIX} 4` },
	{ value: 'h5', label: `${UI_EDITOR_HEADING_PREFIX} 5` },
	{ value: 'h6', label: `${UI_EDITOR_HEADING_PREFIX} 6` },
]

// Тонкая обёртка над обработчиком ввода: разрывает цикл
// useEditorToolbar(onInput) ↔ handleInput(зависит от outputs тулбара).
// handleInput назначается ниже, после деструктуризации тулбара.
const inputHandler = { fn: () => {} }

const {
	activeStates,
	contextMenu,
	contextMenuRef,
	isCodeMode,
	codeContent,
	applyFormat,
	applyBlock,
	handleHeadingChange,
	applyColor,
	applyBackgroundColor,
	resetColor: resetColorFn,
	resetBackgroundColor: resetBackgroundColorFn,
	insertLink,
	clearAllFormatting,
	insertSeparator,
	toggleCodeMode,
	handleCodeInput,
	handleContextMenu,
	applyMediaSize,
	removeMedia,
	saveSelection,
	updateActiveStates,
	handleKeyDown,
	handleImageUpload,
	handleVideoUpload,
	convertInlineHtml,
} = useEditorToolbar({
	editorRef,
	codeTextareaRef,
	onInput: () => inputHandler.fn(),
	promptForUrl: () => prompt(UI_EDITOR_URL_PROMPT),
})

const {
	isFocused,
	isEmpty,
	textColor,
	backgroundColor,
	isTextColorActive,
	isBackgroundColorActive,
	checkEmpty,
	handleTextColor,
	handleBackgroundColor,
	resetTextColor,
	resetBackgroundColor,
} = useEditorState({
	editorRef,
	applyColor,
	applyBackgroundColor,
	resetColor: resetColorFn,
	resetBackgroundColor: resetBackgroundColorFn,
})

function handleInput(): void {
	if (isCodeMode.value) {
		emit('update:modelValue', codeContent.value)
		return
	}
	/* istanbul ignore next -- defensive: editorRef всегда привязан после mount */
	if (!editorRef.value) return
	convertInlineHtml()
	emit('update:modelValue', editorRef.value.innerHTML)
	updateActiveStates()
	checkEmpty()
}
inputHandler.fn = handleInput

function handleFocus(): void {
	isFocused.value = true
	emit('focus')
}

function handleBlur(): void {
	saveSelection()
	isFocused.value = false
	emit('blur')
}

watch(
	() => props.modelValue,
	(newVal: string) => {
		if (!editorRef.value) return
		if (editorRef.value.innerHTML === newVal) return
		editorRef.value.innerHTML = newVal
		checkEmpty()
	},
)

onMounted(() => {
	if (editorRef.value && props.modelValue) {
		editorRef.value.innerHTML = props.modelValue
	}
	checkEmpty()
	if (props.isAutofocus) {
		editorRef.value?.focus()
	}
})
</script>
