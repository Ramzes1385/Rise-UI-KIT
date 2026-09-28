import type { ComputedRef, Ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
/** Composable: логика BaseInputTags — теги из текста по разделителям, клавиатура по тегам и объявления для скринридера */
import { computed, nextTick, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import type { BaseInput } from '@components/BaseInput'
import { useCustomClass } from '@composables/useCustomClass'
import { useFormDisabled } from '@composables/useFormContext'
import type { BaseInputTagsEmits, InputTagsProps } from '../types/BaseInputTags.types'

/** Разбить текст по разделителям: полные части — теги, хвост без разделителя остаётся в поле */
function splitBySeparators(text: string, separators: string[]): { parts: string[]; rest: string } {
	const pattern = new RegExp(`[${separators.map(separator => separator.replace(/[\\\]^-]/g, '\\$&')).join('')}\\n]`)
	const pieces = text.split(pattern)
	const rest = pieces.pop() as string
	return { parts: pieces, rest }
}

/** Фокус: кнопки удаления тегов по индексу и строка ввода */
function useTagFocus(inputRef: Ref<InstanceType<typeof BaseInput> | null>) {
	const removeButtons: (HTMLElement | undefined)[] = []
	return {
		setRemoveButton(element: unknown, index: number): void {
			removeButtons[index] = element instanceof HTMLElement ? element : undefined
		},
		focusInput(): void {
			inputRef.value?.focus()
		},
		focusTag(index: number): void {
			removeButtons[index]?.focus()
		},
	}
}

/** Список тегов: добавление с проверкой и удаление; каждое изменение объявляется скринридеру */
function useTagList(props: InputTagsProps, emit: BaseInputTagsEmits) {
	const announcement = ref('')

	// Пустые части отброшены раньше: тег проходит проверку, не повторяется (isUnique) и укладывается в maxTags
	const canAdd = (tag: string, list: string[]): boolean => {
		if (props.maxTags !== undefined && list.length >= props.maxTags) return false
		if (props.isUnique && list.includes(tag)) return false
		return props.validate ? props.validate(tag) : true
	}
	const announceAdded = (list: string[], added: string[]): void => {
		emit('update:modelValue', list)
		for (const tag of added) emit('add', tag)
		announcement.value = formatMessage(UI_ARIA.TAG_ADDED, { name: added.join(', ') })
	}

	return {
		announcement,
		/** Добавить теги из частей текста; возвращает части, не прошедшие проверку: они остаются в поле для исправления */
		addTags(parts: string[]): string[] {
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
			if (added.length > 0) announceAdded(list, added)
			return rejected
		},
		removeTag(index: number): void {
			const tag = props.modelValue[index]
			emit(
				'update:modelValue',
				props.modelValue.filter((_, itemIndex) => itemIndex !== index),
			)
			emit('remove', tag)
			announcement.value = formatMessage(UI_ARIA.TAG_REMOVED, { name: tag })
		},
	}
}

/** Строка ввода: текст с разделителем превращается в теги, хвост без разделителя остаётся черновиком */
function useDraft(props: InputTagsProps, addTags: (parts: string[]) => string[], canEdit: ComputedRef<boolean>) {
	const draft = ref('')
	const separator = (): string => props.separators[0] ?? ','
	const handleInput = (text: string | number): void => {
		const value = String(text)
		const { parts, rest } = splitBySeparators(value, props.separators)
		if (parts.length === 0) {
			draft.value = value
			return
		}
		const rejected = addTags(parts)
		draft.value = [...rejected, rest].filter(Boolean).join(separator())
	}

	return {
		draft,
		handleInput,
		handlePaste(event: ClipboardEvent): void {
			const text = event.clipboardData?.getData('text') ?? ''
			if (!canEdit.value || splitBySeparators(text, props.separators).parts.length === 0) return
			event.preventDefault()
			handleInput(draft.value + text + separator())
		},
		commitDraft(): boolean {
			const text = draft.value.trim()
			if (!text) return false
			const rejected = addTags([text])
			draft.value = rejected.length > 0 ? draft.value : ''
			return true
		},
	}
}

/** Клавиши на кнопке тега: стрелки, Home и End — между тегами и строкой ввода; Backspace и Delete удаляют тег */
function useTagKeys(props: InputTagsProps, removeAt: (index: number) => void, focus: ReturnType<typeof useTagFocus>) {
	// Фокус после удаления: Backspace — на тег слева, Delete — на тег, вставший на место удалённого; без тегов — в строку ввода
	const removeAndRefocus = (event: KeyboardEvent, index: number): void => {
		const last = props.modelValue.length - 1
		removeAt(index)
		if (last === 0) {
			focus.focusInput()
			return
		}
		const target = Math.min(Math.max(event.key === 'Backspace' ? index - 1 : index, 0), last - 1)
		void nextTick(() => focus.focusTag(target))
	}
	const actions = new Map<string, (event: KeyboardEvent, index: number) => void>([
		['ArrowLeft', (_, index) => focus.focusTag(Math.max(0, index - 1))],
		['ArrowRight', (_, index) => (index < props.modelValue.length - 1 ? focus.focusTag(index + 1) : focus.focusInput())],
		['Home', () => focus.focusTag(0)],
		['End', () => focus.focusInput()],
		['Escape', () => focus.focusInput()],
		['Backspace', removeAndRefocus],
		['Delete', removeAndRefocus],
	])

	return {
		handleTagKeydown(event: KeyboardEvent, index: number): void {
			const action = actions.get(event.key)
			if (!action) return
			action(event, index)
			event.preventDefault()
		},
	}
}

/** Клавиши в строке ввода: Enter добавляет черновик, Backspace и ← в начале строки переводят фокус на последний тег */
function createFieldKeydown(
	props: InputTagsProps,
	canEdit: ComputedRef<boolean>,
	actions: { commitDraft: () => boolean; focusTag: (index: number) => void },
) {
	return (event: KeyboardEvent): void => {
		if (!canEdit.value) return
		const input = event.target as HTMLInputElement
		const isAtStart = input.selectionStart === 0 && input.selectionEnd === 0
		if (event.key === 'Enter') {
			// Пустая строка: Enter отправляет форму как обычно
			if (actions.commitDraft()) event.preventDefault()
		} else if ((event.key === 'Backspace' || event.key === 'ArrowLeft') && isAtStart && props.modelValue.length > 0) {
			event.preventDefault()
			actions.focusTag(props.modelValue.length - 1)
		}
	}
}

export function useBaseInputTags(props: InputTagsProps, emit: BaseInputTagsEmits) {
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'list', 'tag', 'remove'] })
	const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
	// Блокировка: свой isDisabled или неактивная BaseForm вокруг
	const isControlDisabled = useFormDisabled(() => props.isDisabled)
	const canEdit = computed(() => !isControlDisabled.value && !props.isReadonly)
	const focus = useTagFocus(inputRef)
	const { announcement, addTags, removeTag } = useTagList(props, emit)
	const { draft, handleInput, handlePaste, commitDraft } = useDraft(props, addTags, canEdit)
	const removeAt = (index: number, isFromButton = false): void => {
		removeTag(index)
		if (isFromButton) focus.focusInput()
	}

	return {
		classes,
		inputRef,
		draft,
		announcement,
		isControlDisabled,
		canEdit,
		setRemoveButton: focus.setRemoveButton,
		removeAt,
		handleInput,
		handlePaste,
		handleKeydown: createFieldKeydown(props, canEdit, { commitDraft, focusTag: focus.focusTag }),
		...useTagKeys(props, removeAt, focus),
		handleBlur(event: FocusEvent): void {
			if (props.isAddOnBlur && canEdit.value) commitDraft()
			emit('blur', event)
		},
		exposed: {
			focus: focus.focusInput,
			blur: () => inputRef.value?.blur(),
			validate: () => inputRef.value?.validate() ?? true,
			reset: () => inputRef.value?.reset(),
		},
	}
}
