<template>
	<!--
		Поле тегов: Enter или разделитель (запятая) добавляет тег, вставка списка — несколько тегов. Теги — список перед
		строкой ввода, у каждого кнопка «Удалить» вне порядка Tab: с клавиатуры к тегам ведут ← и Backspace в пустой строке,
		между тегами — ←/→, удаление — Backspace, Delete, Enter
	-->
	<div class="base-input-tags" :class="[{ 'base-input-tags--has-tags': modelValue.length > 0 }, classes.root]">
		<BaseInput
			ref="inputRef"
			:model-value="draft"
			:variant="variant"
			:label="label"
			:placeholder="placeholder"
			:error="error"
			:is-disabled="isControlDisabled"
			:is-readonly="isReadonly"
			:is-required="isRequired"
			:aria-label="ariaLabel"
			:input-attrs="{ autocomplete: 'off', ...inputAttrs }"
			:size-scale="sizeScale"
			:color="color"
			:custom-class="{ field: classes.field }"
			@update:model-value="handleInput"
			@keydown="handleKeydown"
			@blur="handleBlur"
			@focus="emit('focus', $event)"
			@paste="handlePaste">
			<template v-if="modelValue.length > 0" #prefix>
				<!-- У отключённого поля теги — часть неактивного элемента: aria-disabled (и исключение из проверки контраста) -->
				<ul
					class="base-input-tags__list"
					:class="classes.list"
					:aria-label="UI_ARIA.TAGS"
					:aria-disabled="isControlDisabled ? 'true' : undefined">
					<li v-for="(tag, index) in modelValue" :key="`${tag}-${index}`" class="base-input-tags__tag" :class="classes.tag">
						<span class="base-input-tags__text">{{ tag }}</span>
						<button
							v-if="canEdit"
							:ref="element => setRemoveButton(element, index)"
							type="button"
							class="base-input-tags__remove"
							:class="classes.remove"
							tabindex="-1"
							:aria-label="formatMessage(UI_ARIA.TAG_REMOVE, { name: tag })"
							@mousedown.prevent
							@click="removeAt(index, true)"
							@keydown="handleTagKeydown($event, index)">
							<BaseIcon name="x-mark" :size-scale="calcIconScale('xs', sizeScale)" />
						</button>
					</li>
				</ul>
			</template>
		</BaseInput>
		<!-- Добавление и удаление тегов для скринридера -->
		<span class="base-input-tags__status" role="status">{{ announcement }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { BaseIcon } from '@components/BaseIcon'
import { BaseInput } from '@components/BaseInput'
import { useCustomClass } from '@composables/useCustomClass'
import { kitDefaults } from '@composables/useDefaults'
import { useFormDisabled } from '@composables/useFormContext'
import { DEFAULT_VARIANT, SIZE_SCALE_DEFAULT, UI_ARIA } from '@constants'
import { calcIconScale } from '@utils/iconUtils'
import '../styles/BaseInputTags.style.scss'
import type { BaseInputTagsEmits, BaseInputTagsProps } from '../model/BaseInputTags.types'

const props = withDefaults(defineProps<BaseInputTagsProps>(), kitDefaults('BaseInputTags', {
	variant: DEFAULT_VARIANT,
	modelValue: () => [],
	isDisabled: false,
	isReadonly: false,
	isRequired: false,
	isUnique: true,
	separators: () => [','],
	isAddOnBlur: true,
	sizeScale: SIZE_SCALE_DEFAULT,
}))

const emit = defineEmits<BaseInputTagsEmits>()

const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'list', 'tag', 'remove'] })

const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
const draft = ref('')
const announcement = ref('')

/** Блокировка: свой isDisabled или неактивная BaseForm вокруг */
const isControlDisabled = useFormDisabled(() => props.isDisabled)
const canEdit = computed(() => !isControlDisabled.value && !props.isReadonly)

const removeButtons: (HTMLElement | undefined)[] = []

function setRemoveButton(element: unknown, index: number): void {
	removeButtons[index] = element instanceof HTMLElement ? element : undefined
}

function focusInput(): void {
	inputRef.value?.focus()
}

function focusTag(index: number): void {
	removeButtons[index]?.focus()
}

/** Можно ли добавить тег (пустые части отброшены раньше): проходит проверку, без повтора (isUnique), в пределах maxTags */
function canAdd(tag: string, list: string[]): boolean {
	if (props.maxTags !== undefined && list.length >= props.maxTags) return false
	if (props.isUnique && list.includes(tag)) return false
	return props.validate ? props.validate(tag) : true
}

/**
 * Добавить теги из частей текста. Возвращает части, которые не удалось добавить из-за проверки:
 * они остаются в поле, чтобы их можно было исправить
 */
function addTags(parts: string[]): string[] {
	const list = [...props.modelValue]
	const rejected: string[] = []
	const added: string[] = []
	for (const part of parts.map(item => item.trim()).filter(Boolean)) {
		if (canAdd(part, list)) {
			list.push(part)
			added.push(part)
		} else if (props.validate && !props.validate(part)) {
			rejected.push(part)
		}
	}
	if (added.length > 0) {
		emit('update:modelValue', list)
		for (const tag of added) emit('add', tag)
		announcement.value = formatMessage(UI_ARIA.TAG_ADDED, { name: added.join(', ') })
	}
	return rejected
}

function removeAt(index: number, isFromButton = false): void {
	const tag = props.modelValue[index]
	emit('update:modelValue', props.modelValue.filter((_, itemIndex) => itemIndex !== index))
	emit('remove', tag)
	announcement.value = formatMessage(UI_ARIA.TAG_REMOVED, { name: tag })
	if (isFromButton) focusInput()
}

/** Разбить текст по разделителям: полные части — теги, хвост без разделителя остаётся в поле */
function splitBySeparators(text: string): { parts: string[]; rest: string } {
	const pattern = new RegExp(`[${props.separators.map(separator => separator.replace(/[\\\]^-]/g, '\\$&')).join('')}\\n]`)
	const pieces = text.split(pattern)
	const rest = pieces.pop() as string
	return { parts: pieces, rest }
}

function handleInput(text: string | number): void {
	const value = String(text)
	const { parts, rest } = splitBySeparators(value)
	if (parts.length === 0) {
		draft.value = value
		return
	}
	const rejected = addTags(parts)
	draft.value = [...rejected, rest].filter(Boolean).join(props.separators[0] ?? ',')
}

function handlePaste(event: ClipboardEvent): void {
	const text = event.clipboardData?.getData('text') ?? ''
	if (!canEdit.value || splitBySeparators(text).parts.length === 0) return
	event.preventDefault()
	handleInput(draft.value + text + (props.separators[0] ?? ','))
}

function commitDraft(): boolean {
	const text = draft.value.trim()
	if (!text) return false
	const rejected = addTags([text])
	draft.value = rejected.length > 0 ? draft.value : ''
	return true
}

function handleKeydown(event: KeyboardEvent): void {
	if (!canEdit.value) return
	const input = event.target as HTMLInputElement
	const isAtStart = input.selectionStart === 0 && input.selectionEnd === 0
	if (event.key === 'Enter') {
		// Пустая строка: Enter отправляет форму как обычно
		if (commitDraft()) event.preventDefault()
	} else if ((event.key === 'Backspace' || event.key === 'ArrowLeft') && isAtStart && props.modelValue.length > 0) {
		event.preventDefault()
		focusTag(props.modelValue.length - 1)
	}
}

function handleTagKeydown(event: KeyboardEvent, index: number): void {
	const last = props.modelValue.length - 1
	switch (event.key) {
		case 'ArrowLeft':
			focusTag(Math.max(0, index - 1))
			break
		case 'ArrowRight':
			if (index < last) focusTag(index + 1)
			else focusInput()
			break
		case 'Home':
			focusTag(0)
			break
		case 'End':
		case 'Escape':
			focusInput()
			break
		case 'Backspace':
		case 'Delete': {
			removeAt(index)
			// Фокус: Backspace — на тег слева, Delete — на тег, вставший на место удалённого; без тегов — в строку ввода
			if (last === 0) {
				focusInput()
				break
			}
			const target = Math.min(Math.max(event.key === 'Backspace' ? index - 1 : index, 0), last - 1)
			void nextTick(() => focusTag(target))
			break
		}
		default:
			return
	}
	event.preventDefault()
}

function handleBlur(event: FocusEvent): void {
	if (props.isAddOnBlur && canEdit.value) commitDraft()
	emit('blur', event)
}

defineExpose({
	focus: focusInput,
	blur: () => inputRef.value?.blur(),
	validate: () => inputRef.value?.validate() ?? true,
	reset: () => inputRef.value?.reset(),
})
</script>
