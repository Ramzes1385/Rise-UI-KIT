import { useChatVoice } from './useChatVoice'
import { computed, nextTick, onMounted, useId, watch } from 'vue'
import { useChatInputState } from '@composables/chat/useChatInputState'
import type { ChatInputEmits, ChatInputProps } from '../types/ChatInput.types'

const QUICK_REPLY_SCALE = 0.875

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
		...useChatVoice(props, emit, state),
		quickReplyScale: QUICK_REPLY_SCALE,
		suggestionsId,
		isSuggestionsOpen: computed(
			() =>
				(state.showMentions.value && state.filteredMembers.value.length > 0) ||
				(state.showCommands.value && state.filteredCommands.value.length > 0),
		),
		setTextareaRef(element: unknown): void {
			state.inputComponentRef.value = element instanceof HTMLTextAreaElement ? { inputRef: element } : null
		},
		handleKeyUp(event: KeyboardEvent): void {
			if (event.key === 'Escape') return
			state.checkAutocomplete()
		},
		handleCancelReply: (): void => emit('cancel-reply'),
		handleQuickReply: (reply: string): void => emit('quick-reply', reply),
	}
}
