/** Composable: подсказки упоминаний (`@`) и команд (`/`) у поля ввода чата */
import { computed, watch } from 'vue'
import type { ChatSuggestionState, UseChatSuggestionsOptions } from './types/useChatInputState.types'
import {
	applyAutocompleteWord,
	createSuggestionState,
	filterCommands,
	filterMembers,
	focusCaretLater,
	getWordBeforeCaret,
	hideSuggestions,
	insertCommandTrigger,
	openCommandList,
	replaceWordBeforeCaret,
} from './chatInputText'

/** Список подсказок сократился (смена `members`/`commands`) — активный пункт не выходит за его конец */
function clampActiveIndex(state: ChatSuggestionState, getLength: () => number): void {
	watch(getLength, length => {
		if (state.activeSuggestionIndex.value >= length) state.activeSuggestionIndex.value = Math.max(0, length - 1)
	})
}

/** Состояние подсказок, автокомплит по слову перед кареткой, подстановка выбранного и кнопка команд */
function useChatSuggestions(options: UseChatSuggestionsOptions) {
	const { props, text, getInputElement } = options
	const state = createSuggestionState()

	function checkAutocomplete(): void {
		const inputEl = getInputElement()
		/* istanbul ignore next — defensive */
		if (!inputEl) {
			hideSuggestions(state)
			return
		}
		/* istanbul ignore next — defensive */
		const cursorPosition = inputEl.selectionStart ?? 0
		applyAutocompleteWord(state, getWordBeforeCaret(text.value.slice(0, cursorPosition)))
	}

	function replaceCurrentWord(prefix: string, value: string): string | null {
		const inputEl = getInputElement()
		/* istanbul ignore next — defensive */
		if (!inputEl) return null
		/* istanbul ignore next — defensive */
		const cursorPosition = inputEl.selectionStart ?? 0
		const edit = replaceWordBeforeCaret(text.value, cursorPosition, `${prefix}${value} `)
		text.value = edit.text
		hideSuggestions(state)
		focusCaretLater(inputEl, edit.caret)
		return edit.text
	}

	function toggleCommands(): void {
		if (state.showCommands.value) {
			state.showCommands.value = false
			return
		}
		const inputEl = getInputElement()
		/* istanbul ignore next — defensive */
		const cursorPosition = inputEl?.selectionStart ?? text.value.length
		const edit = insertCommandTrigger(text.value, cursorPosition)
		openCommandList(state)
		text.value = edit.text
		focusCaretLater(inputEl, edit.caret)
	}

	const filteredMembers = computed(() => filterMembers(props.members ?? [], state.mentionQuery.value))
	const filteredCommands = computed(() => filterCommands(props.commands ?? [], state.commandQuery.value))
	clampActiveIndex(state, () => (state.showCommands.value ? filteredCommands.value : filteredMembers.value).length)

	return {
		showMentions: state.showMentions,
		showCommands: state.showCommands,
		activeSuggestionIndex: state.activeSuggestionIndex,
		hasCommands: computed(() => (props.commands ?? []).length > 0),
		filteredMembers,
		filteredCommands,
		checkAutocomplete,
		replaceCurrentWord,
		toggleCommands,
	}
}

export { useChatSuggestions }
