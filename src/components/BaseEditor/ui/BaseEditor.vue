<template>
	<div
		class="base-editor"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
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

		<!-- Область редактирования: role="textbox" + aria-multiline — так её озвучивают как многострочное поле -->
		<div
			v-if="!isCodeMode"
			ref="editorRef"
			class="base-editor__content"
			:class="[{ 'base-editor__content--empty': isEmpty }, classes.content]"
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

		<!-- Режим кода: подпись поля скрыта визуально, но задаёт доступное имя; высота растёт по тексту до --editor-max-height -->
		<BaseTextarea
			v-if="isCodeMode"
			ref="codeTextareaRef"
			class="base-editor__code"
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
			<!-- Меню размера медиа (правый клик по изображению или видео). В body масштаб не наследуется — задаём его сами -->
			<div
				v-if="contextMenu.isVisible"
				ref="contextMenuRef"
				class="base-editor__context-menu"
				role="dialog"
				:aria-label="UI_EDITOR.MEDIA_MENU_LABEL"
				:style="[sizeScaleStyle, { left: contextMenu.x + 'px', top: contextMenu.y + 'px' }, layerStyle]"
				:data-theme="inheritedTheme">
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
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { UI_EDITOR } from '@/locales/messages'
import '../styles/BaseEditor.style.scss'

import { BaseInput } from '@components/BaseInput'
import { BaseButton } from '@components/BaseButton'
import { kitDefaults } from '@composables/useDefaults'
import { BaseTextarea } from '@components/BaseTextarea'
import { useEscapeKey } from '@composables/useEscapeKey'
import { useLayerIndex } from '@composables/useLayerStack'
import { escapeHtml, sanitizeHtml } from '@utils/htmlUtils'
import { useEditorState } from '@composables/useEditorState'
import { useEditorToolbar } from '@composables/useEditorToolbar'
import { isolateFormField, useFormDisabled } from '@composables/useFormContext'
import { useInheritedTheme, useTeleportTarget } from '@composables/useTeleportTarget'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, useStandardBaseComponent } from '@composables/useBaseComponent'
import BaseEditorToolbar from './BaseEditorToolbar.vue'
import { EDITOR_MENU_SCALE_RATIO } from '../model/BaseEditor.types'
import type { BaseSelectOption } from '@components/BaseSelect'
import type { BaseEditorEmits, BaseEditorProps, BaseEditorSlots } from '../model/BaseEditor.types'

/** Куда телепортируются слои: body или контейнер из плагина и BaseApp (teleportTo) */
const teleportTarget = useTeleportTarget()

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

/** Только чтение: свой isReadonly или неактивная BaseForm вокруг (fieldset формы не блокирует contenteditable) */
const isLocked = useFormDisabled(() => props.isReadonly)

// Поле адреса ссылки и списки панели — служебные: они не становятся полем BaseFormField вокруг редактора
isolateFormField()

const { sizeScaleStyle, variantClass, variantStyle, customColorStyle, classes } = useStandardBaseComponent('base-editor', props, [
	'root',
	'toolbar',
	'btn',
	'group',
	'colorPicker',
	'headingSelect',
	'fileInput',
	'content',
	'code',
])

const emit = defineEmits<BaseEditorEmits>()
defineSlots<BaseEditorSlots>()

const editorRef = ref<HTMLDivElement | null>(null)
const codeTextareaRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(null)

/** Поля и кнопки меню медиа — размер sm (28px при sizeScale = 100): меню компактнее основных контролов */
const menuControlScale = computed(() => props.sizeScale * EDITOR_MENU_SCALE_RATIO)

const headingOptions: BaseSelectOption[] = [
	{ value: 'p', label: UI_EDITOR.PARAGRAPH },
	{ value: 'h1', label: `${UI_EDITOR.HEADING_PREFIX} 1` },
	{ value: 'h2', label: `${UI_EDITOR.HEADING_PREFIX} 2` },
	{ value: 'h3', label: `${UI_EDITOR.HEADING_PREFIX} 3` },
	{ value: 'h4', label: `${UI_EDITOR.HEADING_PREFIX} 4` },
	{ value: 'h5', label: `${UI_EDITOR.HEADING_PREFIX} 5` },
	{ value: 'h6', label: `${UI_EDITOR.HEADING_PREFIX} 6` },
]

/** Очистка HTML по пропу sanitize: своя функция или встроенный allowlist */
function sanitizeContent(html: string): string {
	return (props.sanitize ?? sanitizeHtml)(html)
}

// handleInput зависит от outputs обоих composables, поэтому определяется после них.
// Ленивый вызов через замыкание разрывает цикл зависимости.
let handleInput: () => void = () => {}

const {
	activeStates,
	contextMenu,
	contextMenuRef,
	closeContextMenu,
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
	onInput: () => handleInput(),
	promptForUrl: () => prompt(UI_EDITOR.URL_PROMPT),
	isReadonly: () => isLocked.value,
	sanitize: sanitizeContent,
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

handleInput = () => {
	if (isCodeMode.value) {
		emit('update:modelValue', sanitizeContent(codeContent.value))
		return
	}
	/* istanbul ignore next -- defensive: editorRef всегда привязан после mount */
	if (!editorRef.value) return
	convertInlineHtml()
	emit('update:modelValue', sanitizeContent(editorRef.value.innerHTML))
	updateActiveStates()
	checkEmpty()
}

/**
 * Вставка из буфера обмена: HTML очищается, простой текст вставляется как текст с переносами строк.
 * Без перехвата браузер вставил бы разметку чужой страницы вместе с обработчиками событий.
 */
function handlePaste(event: ClipboardEvent): void {
	const data = event.clipboardData
	if (isLocked.value || !data) return
	const html = data.getData('text/html')
	const text = data.getData('text/plain')
	if (!html && !text) return
	event.preventDefault()
	document.execCommand('insertHTML', false, html ? sanitizeContent(html) : escapeHtml(text).replace(/\r?\n/g, '<br>'))
}

/** Перетаскивание внутри редактора браузер выполняет сам: этот HTML уже очищен */
const isInternalDrag = ref(false)

/** Позиция каретки в точке, куда отпустили перетаскиваемое содержимое */
function getRangeFromPoint(x: number, y: number): Range | null {
	if (typeof document.caretPositionFromPoint === 'function') {
		const position = document.caretPositionFromPoint(x, y)
		if (!position) return null
		const range = document.createRange()
		range.setStart(position.offsetNode, position.offset)
		return range
	}
	return typeof document.caretRangeFromPoint === 'function' ? document.caretRangeFromPoint(x, y) : null
}

/** HTML, перетащенный из другой страницы, вставляется очищенным в точку, куда его отпустили */
function handleDrop(event: DragEvent): void {
	const html = event.dataTransfer?.getData('text/html')
	if (isLocked.value || isInternalDrag.value || !html) return
	event.preventDefault()
	const range = getRangeFromPoint(event.clientX, event.clientY)
	if (range) {
		const selection = window.getSelection()
		selection?.removeAllRanges()
		selection?.addRange(range)
	}
	document.execCommand('insertHTML', false, sanitizeContent(html))
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

/** Тема блока, в котором стоит редактор: меню в body иначе взяло бы тему страницы */
const inheritedTheme = useInheritedTheme(
	() => editorRef.value,
	() => contextMenu.isVisible,
)
/** Место меню среди открытых слоёв: меню редактора в окне — над окном */
const layerStyle = useLayerIndex(() => contextMenu.isVisible)

// Escape закрывает меню медиа (фокус возвращает watch ниже)
useEscapeKey({
	isActive: () => contextMenu.isVisible,
	callback: closeContextMenu,
})

// Меню медиа доступно с клавиатуры: при открытии фокус переходит в поле «Ширина»;
// если меню закрылось, пока фокус был внутри (кнопка, Enter, Escape), фокус возвращается в текст
watch(
	() => contextMenu.isVisible,
	isVisible => {
		if (isVisible) {
			nextTick(() => contextMenuRef.value?.querySelector('input')?.focus())
			return
		}
		if (contextMenuRef.value?.contains(document.activeElement)) editorRef.value?.focus()
	},
)

// В режиме чтения тулбара нет: из режима кода было бы не выйти, а меню медиа не должно менять документ
watch(
	() => isLocked.value,
	isReadonly => {
		if (!isReadonly) return
		if (isCodeMode.value) toggleCodeMode()
		closeContextMenu()
	},
)

watch(
	() => props.modelValue,
	(newVal: string) => {
		if (!editorRef.value) return
		if (editorRef.value.innerHTML === newVal) return
		editorRef.value.innerHTML = sanitizeContent(newVal)
		checkEmpty()
	},
)

onMounted(() => {
	if (editorRef.value && props.modelValue) {
		editorRef.value.innerHTML = sanitizeContent(props.modelValue)
	}
	checkEmpty()
	if (props.isAutofocus) {
		editorRef.value?.focus()
	}
})
</script>
