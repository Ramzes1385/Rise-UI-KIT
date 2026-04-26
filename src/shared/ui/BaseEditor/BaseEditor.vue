<template>
	<div
		class="base-editor"
		:style="[sizeScaleStyle, variantStyle, customColorStyle]"
		:class="[
			{
				'base-editor--readonly': isReadonly,
				'base-editor--focused': isFocused,
			},
			variantClass,
		]">
		<!-- Панель инструментов -->
		<div v-if="hasToolbar && !isReadonly" class="base-editor__toolbar" @mousedown.prevent>
			<slot name="toolbar">
				<!-- Форматирование текста -->
				<span class="base-editor__group">
					<BaseTooltip text="Жирный" position="top" :size-scale="sizeScale">
						<BaseButton variant="ghost" class="base-editor__btn" :size-scale="sizeScale" @click="applyFormat('bold')">
							<BaseIcon name="bold" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Курсив" position="top" :size-scale="sizeScale">
						<BaseButton variant="ghost" class="base-editor__btn" :size-scale="sizeScale" @click="applyFormat('italic')">
							<BaseIcon name="italic" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Подчёркнутый" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyFormat('underline')">
							<BaseIcon name="underline" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Зачёркнутый" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyFormat('strikeThrough')">
							<BaseIcon name="strike" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Цвет текста -->
				<span class="base-editor__group">
					<BaseTooltip text="Цвет текста" position="top" :size-scale="sizeScale">
						<BaseButton variant="ghost" tag="label" class="base-editor__btn base-editor__btn--color" :size-scale="sizeScale">
							<BaseIcon name="color-picker" size="xs" :size-scale="sizeScale" />
							<input
								type="color"
								class="base-editor__color-input"
								@input="applyColor(($event.target as HTMLInputElement).value)" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Выравнивание -->
				<span class="base-editor__group">
					<BaseTooltip text="По левому краю" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyFormat('justifyLeft')">
							<BaseIcon name="align-left" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="По центру" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyFormat('justifyCenter')">
							<BaseIcon name="align-center" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="По правому краю" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyFormat('justifyRight')">
							<BaseIcon name="align-right" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="По ширине" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyFormat('justifyFull')">
							<BaseIcon name="align-justify" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Списки -->
				<span class="base-editor__group">
					<BaseTooltip text="Маркированный список" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyFormat('insertUnorderedList')">
							<BaseIcon name="list-bullet" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Нумерованный список" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyFormat('insertOrderedList')">
							<BaseIcon name="list-number" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Заголовки -->
				<span class="base-editor__group">
					<div class="base-editor__heading-select">
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
				<span class="base-editor__group">
					<BaseTooltip text="Ссылка" position="top" :size-scale="sizeScale">
						<BaseButton variant="ghost" class="base-editor__btn" :size-scale="sizeScale" @click="insertLink">
							<BaseIcon name="link" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Изображение" position="top" :size-scale="sizeScale">
						<BaseButton variant="ghost" tag="label" class="base-editor__btn base-editor__btn--color" :size-scale="sizeScale">
							<BaseIcon name="image" size="xs" :size-scale="sizeScale" />
							<input type="file" accept="image/*" class="base-editor__file-input" @change="handleImageUpload" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Видео" position="top" :size-scale="sizeScale">
						<BaseButton variant="ghost" tag="label" class="base-editor__btn base-editor__btn--color" :size-scale="sizeScale">
							<BaseIcon name="video" size="xs" :size-scale="sizeScale" />
							<input type="file" accept="video/*" class="base-editor__file-input" @change="handleVideoUpload" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Код и цитата -->
				<span class="base-editor__group">
					<BaseTooltip text="Цитата" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyBlock('blockquote')">
							<BaseIcon name="quote" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
					<BaseTooltip text="Блок кода" position="top" :size-scale="sizeScale">
						<BaseButton variant="ghost" class="base-editor__btn" :size-scale="sizeScale" @click="applyBlock('pre')">
							<BaseIcon name="code" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
				</span>

				<!-- Очистить форматирование -->
				<span class="base-editor__group">
					<BaseTooltip text="Очистить форматирование" position="top" :size-scale="sizeScale">
						<BaseButton
							variant="ghost"
							class="base-editor__btn"
							:size-scale="sizeScale"
							@click="applyFormat('removeFormat')">
							<BaseIcon name="format-clear" size="xs" :size-scale="sizeScale" />
						</BaseButton>
					</BaseTooltip>
				</span>
			</slot>
		</div>

		<!-- Область редактирования -->
		<div
			ref="editorRef"
			class="base-editor__content"
			:contenteditable="!isReadonly"
			:data-placeholder="placeholder"
			@input="handleInput"
			@focus="handleFocus"
			@blur="handleBlur"></div>
	</div>
</template>

<script setup lang="ts">
import { useCustomColor } from '@/shared/composables/useCustomColor'
import { useSizeScale } from '@/shared/composables/useSizeScale'
import { useVariant } from '@/shared/composables/useVariant'
import { BaseButton } from '@/shared/ui/BaseButton'
import BaseIcon from '@/shared/ui/BaseIcon/BaseIcon.vue'
import type { BaseSelectOption } from '@/shared/ui/BaseSelect'
import { BaseSelect } from '@/shared/ui/BaseSelect'
import { BaseTooltip } from '@/shared/ui/BaseTooltip'
import { onMounted, ref, watch } from 'vue'
import './BaseEditor.style.scss'
import type { BaseEditorEmits, BaseEditorProps } from './BaseEditor.types'

const props = withDefaults(defineProps<BaseEditorProps>(), {
	modelValue: '',
	placeholder: '',
	isReadonly: false,
	variant: 'default',
	hasToolbar: true,
	isAutofocus: false,
	sizeScale: 100,
})

const { sizeScaleStyle } = useSizeScale({ getScale: () => props.sizeScale })
const { variantClass, variantStyle } = useVariant({ block: 'base-editor', getVariant: () => props.variant })
const { customColorStyle } = useCustomColor({ getColor: () => props.color })

const emit = defineEmits<BaseEditorEmits>()

const editorRef = ref<HTMLDivElement | null>(null)
const isFocused = ref(false)
const headingValue = ref<string | number>('p')

/** Опции заголовков */
const headingOptions: BaseSelectOption[] = [
	{ value: 'p', label: 'Параграф' },
	{ value: 'h1', label: 'Заголовок 1' },
	{ value: 'h2', label: 'Заголовок 2' },
	{ value: 'h3', label: 'Заголовок 3' },
]

/** Сохранённая позиция выделения */
let savedRange: Range | null = null

/** Сохранить выделение */
function saveSelection(): void {
	const sel = window.getSelection()
	if (!sel || sel.rangeCount === 0 || !editorRef.value) return
	const range = sel.getRangeAt(0)
	if (editorRef.value.contains(range.commonAncestorContainer)) {
		savedRange = range.cloneRange()
	}
}

/** Восстановить выделение */
function restoreSelection(): boolean {
	if (!savedRange) return false
	const sel = window.getSelection()
	if (!sel) return false
	sel.removeAllRanges()
	sel.addRange(savedRange)
	return true
}

/** Применить inline-формат */
function applyFormat(command: string): void {
	restoreSelection()
	document.execCommand(command, false)
	saveSelection()
	handleInput()
}

/** Применить блочный формат (цитата, код) */
function applyBlock(tag: string): void {
	restoreSelection()
	document.execCommand('formatBlock', false, tag)
	saveSelection()
	handleInput()
}

/** Смена заголовка через select */
function handleHeadingChange(value: string | number | (string | number)[]): void {
	restoreSelection()
	document.execCommand('formatBlock', false, String(value))
	saveSelection()
	handleInput()
}

/** Применить цвет текста */
function applyColor(color: string): void {
	restoreSelection()
	document.execCommand('foreColor', false, color)
	saveSelection()
	handleInput()
}

/** Вставить ссылку */
function insertLink(): void {
	restoreSelection()
	const url = prompt('Введите URL ссылки:')
	if (!url) return
	document.execCommand('createLink', false, url)
	saveSelection()
	handleInput()
}

/** Загрузить изображение */
function handleImageUpload(event: Event): void {
	const input = event.target as HTMLInputElement
	if (!input.files?.length) return
	const file = input.files[0]
	const url = URL.createObjectURL(file)
	restoreSelection()
	document.execCommand('insertImage', false, url)
	saveSelection()
	input.value = ''
	handleInput()
}

/** Загрузить видео */
function handleVideoUpload(event: Event): void {
	const input = event.target as HTMLInputElement
	if (!input.files?.length) return
	const file = input.files[0]
	const url = URL.createObjectURL(file)
	const html = `<video src="${url}" controls style="max-width:100%;border-radius:8px;"></video><br/>`
	restoreSelection()
	document.execCommand('insertHTML', false, html)
	saveSelection()
	input.value = ''
	handleInput()
}

/** Обработка ввода */
function handleInput(): void {
	if (!editorRef.value) return
	emit('update:modelValue', editorRef.value.innerHTML)
}

/** Обработка фокуса */
function handleFocus(): void {
	isFocused.value = true
	emit('focus')
}

/** Обработка потери фокуса */
function handleBlur(): void {
	saveSelection()
	isFocused.value = false
	emit('blur')
}

/** Синхронизация внешнего modelValue */
watch(
	() => props.modelValue,
	(newVal: string) => {
		if (!editorRef.value) return
		if (editorRef.value.innerHTML === newVal) return
		editorRef.value.innerHTML = newVal
	},
)

onMounted(() => {
	if (editorRef.value && props.modelValue) {
		editorRef.value.innerHTML = props.modelValue
	}
	if (props.isAutofocus) {
		editorRef.value?.focus()
	}
})
</script>
