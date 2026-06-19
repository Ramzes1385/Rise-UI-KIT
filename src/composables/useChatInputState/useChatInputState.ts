import { computed, nextTick, ref, watch } from 'vue'
import { toHTMLInputElement } from '@utils/domUtils'
import { formatFileSize } from '@utils/fileUtils'
import { generateId } from '@utils/idUtils'
import type { UseChatInputStateOptions, BaseInputExposed } from './useChatInputState.types'
import type { ChatMessageAttachment } from '@components/BaseChat/model/BaseChat.types'

/** Описание: управляет состоянием ввода чата — текст, вложения, автокомплит упоминаний/команд, навигация по подсказкам и отправка сообщений */
function useChatInputState(options: UseChatInputStateOptions) {
	const { props, emit } = options

	const text = ref('')
	const fileInputRef = ref<HTMLInputElement | null>(null)
	const attachments = ref<ChatMessageAttachment[]>([])

	const inputComponentRef = ref<BaseInputExposed | null>(null)
	const showMentions = ref(false)
	const showCommands = ref(false)
	const mentionQuery = ref('')
	const commandQuery = ref('')
	const activeSuggestionIndex = ref(0)

	function getInputElement(): HTMLInputElement | null {
		return inputComponentRef.value?.inputRef ?? null
	}

	const hasCommands = computed(() => (props.commands ?? []).length > 0)

	const filteredMembers = computed(() => {
		const query = mentionQuery.value
		return (props.members ?? []).filter(
			member => member.name.toLowerCase().includes(query) || (member.role && member.role.toLowerCase().includes(query)),
		)
	})

	const filteredCommands = computed(() => {
		const query = commandQuery.value
		return (props.commands ?? []).filter(command => command.name.toLowerCase().includes(query))
	})

	function checkAutocomplete(): void {
		const inputEl = getInputElement()
		/* istanbul ignore next — defensive */
		if (!inputEl) {
			showMentions.value = false
			showCommands.value = false
			return
		}

		/* istanbul ignore next — defensive */
		const cursorPosition = inputEl.selectionStart ?? 0
		const textBeforeCursor = text.value.slice(0, cursorPosition)

		const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ')
		const currentWord = lastSpaceIndex === -1 ? textBeforeCursor : textBeforeCursor.slice(lastSpaceIndex + 1)

		if (currentWord.startsWith('@')) {
			if (!showMentions.value) {
				activeSuggestionIndex.value = 0
			}
			showMentions.value = true
			showCommands.value = false
			mentionQuery.value = currentWord.slice(1).toLowerCase()
		} else if (currentWord.startsWith('/')) {
			if (!showCommands.value) {
				activeSuggestionIndex.value = 0
			}
			showCommands.value = true
			showMentions.value = false
			commandQuery.value = currentWord.slice(1).toLowerCase()
		} else {
			showMentions.value = false
			showCommands.value = false
		}
	}

	watch(text, () => {
		nextTick(() => {
			checkAutocomplete()
		})
	})

	function replaceCurrentWord(prefix: string, value: string): string | null {
		const inputEl = getInputElement()
		/* istanbul ignore next — defensive */
		if (!inputEl) return null

		/* istanbul ignore next — defensive */
		const cursorPosition = inputEl.selectionStart ?? 0
		const textBeforeCursor = text.value.slice(0, cursorPosition)
		const textAfterCursor = text.value.slice(cursorPosition)

		const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ')
		const newTextBefore =
			lastSpaceIndex === -1
				? `${prefix}${value} `
				: textBeforeCursor.slice(0, lastSpaceIndex + 1) + `${prefix}${value} `

		const nextText = newTextBefore + textAfterCursor

		text.value = nextText
		showMentions.value = false
		showCommands.value = false

		nextTick(() => {
			inputEl.focus()
			const newCursorPos = newTextBefore.length
			inputEl.setSelectionRange(newCursorPos, newCursorPos)
		})

		return nextText
	}

	function toggleCommands(): void {
		if (showCommands.value) {
			showCommands.value = false
			return
		}

		const inputEl = getInputElement()
		/* istanbul ignore next — defensive */
		const cursorPosition = inputEl?.selectionStart ?? text.value.length
		const textBeforeCursor = text.value.slice(0, cursorPosition)
		const textAfterCursor = text.value.slice(cursorPosition)

		const needsLeadingSpace = textBeforeCursor.length > 0 && !textBeforeCursor.endsWith(' ')
		const inserted = needsLeadingSpace ? ' /' : '/'
		const newTextBefore = textBeforeCursor + inserted

		commandQuery.value = ''
		activeSuggestionIndex.value = 0
		showMentions.value = false
		showCommands.value = true
		text.value = newTextBefore + textAfterCursor

		nextTick(() => {
			/* istanbul ignore next — defensive */
			if (!inputEl) return
			inputEl.focus()
			const caret = newTextBefore.length
			inputEl.setSelectionRange(caret, caret)
		})
	}

	function handleSuggestionNavigation(
		event: KeyboardEvent,
		items: { name: string }[],
		prefix: string,
		showFlag: { value: boolean },
	): boolean {
		if (items.length === 0) return false

		if (event.key === 'ArrowDown') {
			event.preventDefault()
			activeSuggestionIndex.value = (activeSuggestionIndex.value + 1) % items.length
			return true
		}

		if (event.key === 'ArrowUp') {
			event.preventDefault()
			activeSuggestionIndex.value = (activeSuggestionIndex.value - 1 + items.length) % items.length
			return true
		}

		if (event.key === 'Enter') {
			event.preventDefault()
			const selected = items[activeSuggestionIndex.value]
			if (!selected) return true

			const nextText = replaceCurrentWord(prefix, selected.name)
			if (nextText) {
				sendMessage(nextText)
			}

			return true
		}

		if (event.key === 'Escape') {
			event.preventDefault()
			showFlag.value = false
			return true
		}

		return false
	}

	function handleKeyDown(event: KeyboardEvent): void {
		if (showMentions.value && handleSuggestionNavigation(event, filteredMembers.value, '@', showMentions)) return
		if (showCommands.value && handleSuggestionNavigation(event, filteredCommands.value, '/', showCommands)) return

		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault()
			handleSend()
		}
	}

	function triggerFileSelect(): void {
		fileInputRef.value?.click()
	}

	function handleFileChange(event: Event): void {
		const target = toHTMLInputElement(event.target)
		if (!target) return
		/* istanbul ignore next -- defensive */
		if (!target.files || target.files.length === 0) return

		emit('attach', target.files)

		for (let index = 0; index < target.files.length; index++) {
			const file = target.files[index]
			const isImage = file.type.startsWith('image/')
			attachments.value.push({
				id: generateId(),
				name: file.name,
				type: isImage ? 'image' : 'file',
				url: URL.createObjectURL(file),
				size: formatFileSize(file.size),
			})
		}

		target.value = ''
	}

	function removeAttachment(index: number): void {
		const attachment = attachments.value[index]
		if (attachment.url.startsWith('blob:')) {
			URL.revokeObjectURL(attachment.url)
		}
		attachments.value.splice(index, 1)
	}

	function insertEmoji(emoji: string): void {
		text.value += emoji
	}

	function sendMessage(messageText = text.value): void {
		const trimmedText = messageText.trim()
		if (!trimmedText && attachments.value.length === 0) return

		emit('send', {
			text: trimmedText,
			attachments: attachments.value.length > 0 ? [...attachments.value] : undefined,
		})

		text.value = ''
		attachments.value = []
	}

	function handleSend(): void {
		sendMessage()
	}

	return {
		text,
		fileInputRef,
		attachments,
		inputComponentRef,
		showMentions,
		showCommands,
		activeSuggestionIndex,
		hasCommands,
		filteredMembers,
		filteredCommands,
		checkAutocomplete,
		replaceCurrentWord,
		toggleCommands,
		handleKeyDown,
		triggerFileSelect,
		handleFileChange,
		removeAttachment,
		insertEmoji,
		handleSend,
	}
}

export { useChatInputState }
