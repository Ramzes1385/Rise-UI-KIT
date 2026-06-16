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
			@reset-background-color="resetBackgroundColorState">
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
						placeholder="Ширина"
						:size-scale="80"
						@update:model-value="contextMenu.width = String($event)" />
					<BaseInput
						:model-value="contextMenu.height"
						type="number"
						placeholder="Высота"
						:size-scale="80"
						@update:model-value="contextMenu.height = String($event)" />
				</div>
				<div class="base-editor__context-menu-actions">
					<BaseButton :size-scale="80" @click="applyMediaSize">Применить</BaseButton>
					<BaseButton variant="ghost" :size-scale="80" @click="removeMedia">Удалить</BaseButton>
				</div>
			</div>
		</Teleport>
	</div>
</template>

<script setup lang="ts">
import type { BaseEditorEmits, BaseEditorProps } from '../model/BaseEditor.types'

import '../styles/BaseEditor.style.scss'

import { BaseButton } from '@components/BaseButton'
import { BaseInput } from '@components/BaseInput'
import { BaseTextarea } from '@components/BaseTextarea'
import { useBaseComponent } from '@composables/useBaseComponent'
import { useEditorToolbar } from '@composables/useEditorToolbar'
import { onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'
import type { BaseSelectOption } from '@components/BaseSelect'

import BaseEditorToolbar from './BaseEditorToolbar.vue'

/* eslint-disable vue/require-default-prop -- intentionally optional props keep Vue runtime behavior unchanged after withDefaults removal */
const props = defineProps({
	customClass: [String, Object] as PropType<BaseEditorProps['customClass']>,
	modelValue: { type: String, default: '' },
	placeholder: { type: String, default: '' },
	isReadonly: { type: Boolean, default: false },
	variant: { type: String as PropType<BaseEditorProps['variant']>, default: 'default' },
	color: Object as PropType<BaseEditorProps['color']>,
	hasToolbar: { type: Boolean, default: true },
	isAutofocus: { type: Boolean, default: false },
	sizeScale: { type: Number, default: 100 },
})
/* eslint-enable vue/require-default-prop */

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useBaseComponent({
	block: 'base-editor',
	getVariant: () => props.variant,
	getSizeScale: () => props.sizeScale,
	getColor: () => props.color,
	getClass: () => props.customClass,
	elementKeys: ['root', 'toolbar', 'btn', 'group', 'colorPicker', 'headingSelect', 'fileInput', 'content', 'code'],
})

const emit = defineEmits<BaseEditorEmits>()

const editorRef = ref<HTMLDivElement | null>(null)
const codeTextareaRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null)
const isFocused = ref(false)
const isEmpty = ref(true)
const textColor = ref('#000000')
const backgroundColor = ref('#ffff00')

function checkEmpty(): void {
	/* istanbul ignore next -- defensive: editorRef всегда привязан после mount */
	if (!editorRef.value) return
	isEmpty.value = (editorRef.value.textContent ?? '').trim() === ''
}

const headingOptions: BaseSelectOption[] = [
	{ value: 'p', label: 'Параграф' },
	{ value: 'h1', label: 'Заголовок 1' },
	{ value: 'h2', label: 'Заголовок 2' },
	{ value: 'h3', label: 'Заголовок 3' },
	{ value: 'h4', label: 'Заголовок 4' },
	{ value: 'h5', label: 'Заголовок 5' },
	{ value: 'h6', label: 'Заголовок 6' },
]

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
	resetColor,
	resetBackgroundColor,
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
} = useEditorToolbar({ editorRef, codeTextareaRef, onInput: handleInput })

const isTextColorActive = ref(false)
const isBackgroundColorActive = ref(false)

function handleTextColor(color: string): void {
	applyColor(color)
	isTextColorActive.value = true
}

function handleBackgroundColor(color: string): void {
	applyBackgroundColor(color)
	isBackgroundColorActive.value = true
}

function resetTextColor(): void {
	resetColor()
	isTextColorActive.value = false
}

function resetBackgroundColorState(): void {
	resetBackgroundColor()
	isBackgroundColorActive.value = false
}

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
