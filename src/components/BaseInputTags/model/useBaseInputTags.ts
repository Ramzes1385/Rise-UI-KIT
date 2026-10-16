import type { ComputedRef, Ref } from 'vue'
import { UI_ARIA } from '@/locales/messages'
import { computed, nextTick, ref } from 'vue'
import { formatMessage } from '@/locales/state'
import { useUi } from '@composables/base/useUi'
import type { BaseInput } from '@components/BaseInput'
import { useMotion } from '@composables/app/useMotion'
import { isImeKeydown } from '@utils/dom/keyboardUtils'
import { useCustomClass } from '@composables/base/useCustomClass'
import { useFormDisabled } from '@composables/form/useFormContext'
import type { BaseInputTagsEmits, InputTagsProps } from '../types/BaseInputTags.types'

function splitBySeparators(text: string, separators: string[]): { parts: string[]; rest: string } {
	const pattern = new RegExp(`[${separators.map(separator => separator.replace(/[\\\]^-]/g, '\\$&')).join('')}\\n]`)
	const pieces = text.split(pattern)
	const rest = pieces.pop() as string
	return { parts: pieces, rest }
}

function useTagFocus(inputRef: Ref<InstanceType<typeof BaseInput> | null>) {
	const removeButtons: (HTMLElement | undefined)[] = []
	return {
		setRemoveButton(element: unknown, index: number): void {
			const button = (element as { removeButton?: unknown } | null)?.removeButton
			if (button instanceof HTMLElement) removeButtons[index] = button
			else if (!removeButtons[index]?.isConnected) removeButtons[index] = undefined
		},
		focusInput(): void {
			inputRef.value?.focus()
		},
		focusTag(index: number): void {
			removeButtons[index]?.focus()
		},
	}
}

function useTagList(props: InputTagsProps, emit: BaseInputTagsEmits) {
	const announcement = ref('')

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

function useTagKeys(props: InputTagsProps, removeAt: (index: number) => void, focus: ReturnType<typeof useTagFocus>) {
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

function createFieldKeydown(
	props: InputTagsProps,
	canEdit: ComputedRef<boolean>,
	actions: { commitDraft: () => boolean; focusTag: (index: number) => void },
) {
	return (event: KeyboardEvent): void => {
		if (!canEdit.value || isImeKeydown(event)) return
		const input = event.target as HTMLInputElement
		const isAtStart = input.selectionStart === 0 && input.selectionEnd === 0
		if (event.key === 'Enter') {
			if (actions.commitDraft()) event.preventDefault()
		} else if ((event.key === 'Backspace' || event.key === 'ArrowLeft') && isAtStart && props.modelValue.length > 0) {
			event.preventDefault()
			actions.focusTag(props.modelValue.length - 1)
		}
	}
}

function useTagMotion(props: InputTagsProps) {
	const rootRef = ref<HTMLElement | null>(null)
	const motion = useMotion(rootRef)

	return {
		rootRef,
		isMotionReduced: motion.isReduced,
		tagKeys: computed(() =>
			props.modelValue.map((tag, index) => `${tag}#${props.modelValue.slice(0, index).filter(item => item === tag).length}`),
		),
		holdLeavingTag(element: Element): void {
			const tag = element as HTMLElement
			tag.style.left = `${tag.offsetLeft}px`
			tag.style.top = `${tag.offsetTop}px`
			tag.style.width = `${tag.offsetWidth}px`
		},
	}
}

export function useBaseInputTags(props: InputTagsProps, emit: BaseInputTagsEmits) {
	const { classes } = useCustomClass({ getClass: () => props.customClass, elementKeys: ['root', 'field', 'list', 'tag', 'remove'] })
	const inputRef = ref<InstanceType<typeof BaseInput> | null>(null)
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
		ui: useUi(props, 'base-input-tags'),
		...useTagMotion(props),
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
