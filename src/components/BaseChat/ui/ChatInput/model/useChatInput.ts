/** Composable: логика ChatInput — поле сообщения: высота по тексту, подсказки упоминаний и команд, быстрые ответы */
import { computed, nextTick, onMounted, useId, watch } from 'vue'
import { useChatInputState } from '@composables/useChatInputState'
import type { ChatInputEmits, ChatInputProps } from '../types/ChatInput.types'

/** Быстрые ответы — пилюли размера sm (28px) */
const QUICK_REPLY_SCALE = 0.875

/**
 * Высота поля подстраивается под текст (от одной строки до max-height из стилей, дальше — прокрутка).
 * Сначала высота сбрасывается в auto: иначе scrollHeight не меньше текущей высоты и поле только растёт
 */
function adjustFieldHeight(field: HTMLTextAreaElement | HTMLInputElement | null | undefined): void {
	if (!field) return
	field.style.height = 'auto'
	if (field.scrollHeight === 0) {
		field.style.height = ''
		return
	}
	const borders = field.offsetHeight - field.clientHeight
	field.style.height = `${field.scrollHeight + borders}px`
}

export function useChatInput(props: ChatInputProps, emit: ChatInputEmits) {
	const state = useChatInputState({ props, emit })
	const suggestionsId = useId()
	const adjustHeight = (): void => adjustFieldHeight(state.inputComponentRef.value?.inputRef)
	watch(state.text, () => nextTick(adjustHeight))
	onMounted(adjustHeight)

	return {
		...state,
		quickReplyScale: QUICK_REPLY_SCALE,
		suggestionsId,
		// Открыт непустой список подсказок — поле ссылается на него и на выбранный пункт
		isSuggestionsOpen: computed(
			() =>
				(state.showMentions.value && state.filteredMembers.value.length > 0) ||
				(state.showCommands.value && state.filteredCommands.value.length > 0),
		),
		/** Поле ввода для useChatInputState: позиция курсора, фокус, подстановка упоминаний и команд */
		setTextareaRef(element: unknown): void {
			state.inputComponentRef.value = element instanceof HTMLTextAreaElement ? { inputRef: element } : null
		},
		/**
		 * Подсказки пересчитываются после отпускания клавиши (курсор мог сместиться стрелками или Home/End).
		 * Кроме Escape: он закрыл список на keydown, и пересчёт на keyup открыл бы его снова
		 */
		handleKeyUp(event: KeyboardEvent): void {
			if (event.key === 'Escape') return
			state.checkAutocomplete()
		},
		handleCancelReply: (): void => emit('cancel-reply'),
		handleQuickReply: (reply: string): void => emit('quick-reply', reply),
	}
}
