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
		<!-- Панель инструментов -->
		<div v-if="hasToolbar && !isReadonly" class="base-editor__toolbar" :class="classes.toolbar" @mousedown.prevent>
			<slot name="toolbar">
				<!-- Форматирование текста -->
				<span class="base-editor__group" :class="classes.group">
					<BaseTooltip text="Жирный" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isBold }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('bold')">
							<BaseIcon name="bold" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Курсив" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isItalic }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('italic')">
							<BaseIcon name="italic" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Подчёркнутый" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isUnderline }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('underline')">
							<BaseIcon name="underline" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Зачёркнутый" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isStrike }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('strikeThrough')">
							<BaseIcon name="strike" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Цвет текста и фона -->
				<span class="base-editor__group" :class="classes.group">
					<BaseTooltip text="Цвет текста" position="top" :size-scale="sizeScale">
						<BaseColorPicker
							v-model="textColor"
							class="base-editor__color-picker"
							:class="{ 'base-editor__color-picker--active': isTextColorActive }"
							:style="isTextColorActive ? { '--editor-swatch-color': textColor } : undefined"
							:custom-class="{ swatch: classes.colorPicker }"
							:size-scale="sizeScale"
							has-transparent-swatch
							is-resettable
							reset-label="Сбросить цвет текста"
							@mousedown.prevent="saveSelection"
							@change="handleTextColor"
							@reset="resetTextColor">
							<template #trigger>
								<BaseIcon name="color-picker" :size-scale="calcIconScale('md', sizeScale)" />
							</template>
						</BaseColorPicker>
					</BaseTooltip>
					<BaseTooltip text="Цвет фона" position="top" :size-scale="sizeScale">
						<BaseColorPicker
							v-model="backgroundColor"
							class="base-editor__color-picker"
							:class="{ 'base-editor__color-picker--active': isBackgroundColorActive }"
							:style="isBackgroundColorActive ? { '--editor-swatch-color': backgroundColor } : undefined"
							:custom-class="{ swatch: classes.colorPicker }"
							:size-scale="sizeScale"
							has-transparent-swatch
							is-resettable
							reset-label="Сбросить цвет фона"
							@mousedown.prevent="saveSelection"
							@change="handleBackgroundColor"
							@reset="resetBackgroundColorState">
							<template #trigger>
								<BaseIcon name="highlight" :size-scale="calcIconScale('md', sizeScale)" />
							</template>
						</BaseColorPicker>
					</BaseTooltip>
				</span>

				<!-- Выравнивание -->
				<span class="base-editor__group" :class="classes.group">
					<BaseTooltip text="По левому краю" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isJustifyLeft }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('justifyLeft')">
							<BaseIcon name="align-left" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="По центру" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isJustifyCenter }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('justifyCenter')">
							<BaseIcon name="align-center" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="По правому краю" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isJustifyRight }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('justifyRight')">
							<BaseIcon name="align-right" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="По ширине" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isJustifyFull }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('justifyFull')">
							<BaseIcon name="align-justify" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Списки -->
				<span class="base-editor__group" :class="classes.group">
					<BaseTooltip text="Маркированный список" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isUnorderedList }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('insertUnorderedList')">
							<BaseIcon name="list-bullet" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Нумерованный список" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isOrderedList }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyFormat('insertOrderedList')">
							<BaseIcon name="list-number" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Заголовки -->
				<span class="base-editor__group" :class="classes.group">
					<div class="base-editor__heading-select" :class="classes.headingSelect">
						<BaseSelect
							v-model="headingValue"
							:options="headingOptions"
							variant="ghost"
							placeholder="Формат"
							:size-scale="sizeScale"
							@change="handleHeadingChange" />
					</div>
				</span>

				<!-- Медиа -->
				<span class="base-editor__group" :class="classes.group">
					<BaseTooltip text="Ссылка" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[classes.btn]"
							:size-scale="sizeScale"
							@click="insertLink">
							<BaseIcon name="link" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Изображение" position="top" :size-scale="sizeScale">
						<label class="base-editor__btn base-editor__btn--color" :class="classes.btn" @mousedown.stop>
							<BaseIcon name="image" :size-scale="calcIconScale('md', sizeScale)" />
							<input
								type="file"
								accept="image/*"
								class="base-editor__file-input"
								:class="classes.fileInput"
								@change="handleImageUpload" />
						</label>
					</BaseTooltip>
					<BaseTooltip text="Видео" position="top" :size-scale="sizeScale">
						<label class="base-editor__btn base-editor__btn--color" :class="classes.btn" @mousedown.stop>
							<BaseIcon name="video" :size-scale="calcIconScale('md', sizeScale)" />
							<input
								type="file"
								accept="video/*"
								class="base-editor__file-input"
								:class="classes.fileInput"
								@change="handleVideoUpload" />
						</label>
					</BaseTooltip>
				</span>

				<!-- Цитата, блок кода -->
				<span class="base-editor__group" :class="classes.group">
					<BaseTooltip text="Цитата" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isBlockquote }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyBlock('blockquote')">
							<BaseIcon name="quote" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Блок кода" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': activeStates.isPre }, classes.btn]"
							:size-scale="sizeScale"
							@click="applyBlock('pre')">
							<BaseIcon name="code" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Очистить, разделитель, режим кода -->
				<span class="base-editor__group" :class="classes.group">
					<BaseTooltip text="Очистить форматирование" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[classes.btn]"
							:size-scale="sizeScale"
							@click="clearAllFormatting">
							<BaseIcon name="format-clear" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Разделитель" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[classes.btn]"
							:size-scale="sizeScale"
							@click="insertSeparator">
							<BaseIcon name="separator" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip :text="isCodeMode ? 'Визуальный режим' : 'Режим кода'" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:class="[{ 'base-editor__btn--active': isCodeMode }, classes.btn]"
							:size-scale="sizeScale"
							@click="toggleCodeMode">
							<BaseIcon name="code" :size-scale="calcIconScale('md', sizeScale)" />
						</BaseButton>
					</BaseTooltip>
				</span>
			</slot>
		</div>

		<!-- Визуальный режим -->
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

		<!-- Режим кода -->
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
		<!-- Контекстное меню медиа (teleport для корректного fixed) -->
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
import type { BaseEditorEmits, BaseEditorProps } from './BaseEditor.types'

import './BaseEditor.style.scss'

import { BaseButton } from '@components/BaseButton'
import { BaseColorPicker } from '@components/BaseColorPicker'
import { BaseIcon, calcIconScale } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import type { BaseSelectOption } from '@components/BaseSelect'
import { BaseSelect } from '@components/BaseSelect'
import { BaseTextarea } from '@components/BaseTextarea'
import { BaseTooltip } from '@components/BaseTooltip'
import { useCustomClass } from '@composables/useCustomClass'
import { useCustomColor } from '@composables/useCustomColor'
import { useEditorToolbar } from '@composables/useEditorToolbar'
import { useSizeScale } from '@composables/useSizeScale'
import { useVariant } from '@composables/useVariant'
import { onMounted, ref, watch } from 'vue'
import type { PropType } from 'vue'

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

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-editor', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })
const { classes } = useCustomClass({
	getClass: () => props.customClass,
	elementKeys: ['root', 'toolbar', 'btn', 'group', 'colorPicker', 'headingSelect', 'fileInput', 'content', 'code'],
})

const emit = defineEmits<BaseEditorEmits>()

const editorRef = ref<HTMLDivElement | null>(null)
const codeTextareaRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null)
const isFocused = ref(false)
const headingValue = ref<string | number>('p')
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
