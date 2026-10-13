/** Composable: управление состоянием ввода чата */
import { nextTick, ref, watch } from 'vue'
import { focusCaretLater } from './chatInputText'
import { useSuggestionKeys } from './useSuggestionKeys'
import { useChatAttachments } from './useChatAttachments'
import { useChatSuggestions } from './useChatSuggestions'
import type { BaseInputExposed, UseChatInputStateOptions } from './types/useChatInputState.types'

/** keyCode, который браузер ставит клавишам во время набора через IME */
const IME_KEY_CODE = 229

/** Описание: управляет состоянием ввода чата — текст, вложения, автокомплит упоминаний/команд, навигация по подсказкам и отправка сообщений */
function useChatInputState(options: UseChatInputStateOptions) {
	const { props, emit } = options

	const text = ref('')
	const inputComponentRef = ref<BaseInputExposed | null>(null)

	function getInputElement(): HTMLInputElement | HTMLTextAreaElement | null {
		return inputComponentRef.value?.inputRef ?? null
	}

	const { sendMessage: emitMessage, ...attachmentState } = useChatAttachments({ emit, text })
	function sendMessage(messageText?: string): void {
		emitMessage(messageText)
		getInputElement()?.focus()
	}
	const suggestions = useChatSuggestions({ props, text, getInputElement })
	const { handleSuggestionKey } = useSuggestionKeys(suggestions, sendMessage)

	watch(text, () => {
		nextTick(() => {
			suggestions.checkAutocomplete()
		})
	})

	function handleKeyDown(event: KeyboardEvent): void {
		// Enter во время IME-композиции (японский, китайский, корейский) подтверждает ввод, а не отправляет сообщение
		if (event.isComposing || event.keyCode === IME_KEY_CODE) return
		if (handleSuggestionKey(event)) return
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			sendMessage()
		}
	}

	function insertEmoji(emoji: string): void {
		const inputEl = getInputElement()
		const start = inputEl?.selectionStart ?? text.value.length
		const end = inputEl?.selectionEnd ?? start
		const textBefore = text.value.slice(0, start) + emoji
		text.value = textBefore + text.value.slice(end)
		focusCaretLater(inputEl, textBefore.length)
	}

	return {
		text,
		inputComponentRef,
		...attachmentState,
		...suggestions,
		handleKeyDown,
		insertEmoji,
		handleSend: () => sendMessage(),
	}
}

export { useChatInputState }
