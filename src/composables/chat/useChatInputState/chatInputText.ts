/** Утилиты: правка текста поля ввода чата у каретки и разбор слова для подсказок */
import { nextTick, ref } from 'vue'
import type { ChatCommand, ChatMember } from '@components/BaseChat/types/BaseChat.types'
import type { ChatInputElement, ChatSuggestionState, ChatTextEdit } from './types/useChatInputState.types'

/** Слово перед кареткой: от последнего пробела до каретки */
function getWordBeforeCaret(textBeforeCursor: string): string {
	const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ')
	return lastSpaceIndex === -1 ? textBeforeCursor : textBeforeCursor.slice(lastSpaceIndex + 1)
}

/** Заменяет слово перед кареткой вставкой; текст после каретки сохраняется */
function replaceWordBeforeCaret(text: string, cursor: number, insertion: string): ChatTextEdit {
	const textBeforeCursor = text.slice(0, cursor)
	const lastSpaceIndex = textBeforeCursor.lastIndexOf(' ')
	const newTextBefore = lastSpaceIndex === -1 ? insertion : textBeforeCursor.slice(0, lastSpaceIndex + 1) + insertion
	return { text: newTextBefore + text.slice(cursor), caret: newTextBefore.length }
}

/** Вставляет `/` у каретки, отделяя его пробелом от предыдущего слова */
function insertCommandTrigger(text: string, cursor: number): ChatTextEdit {
	const textBeforeCursor = text.slice(0, cursor)
	const needsLeadingSpace = textBeforeCursor.length > 0 && !textBeforeCursor.endsWith(' ')
	const newTextBefore = textBeforeCursor + (needsLeadingSpace ? ' /' : '/')
	return { text: newTextBefore + text.slice(cursor), caret: newTextBefore.length }
}

/** После обновления DOM ставит фокус в поле и каретку в позицию caret */
function focusCaretLater(inputEl: ChatInputElement | null, caret: number): void {
	nextTick(() => {
		if (!inputEl) return
		inputEl.focus()
		inputEl.setSelectionRange(caret, caret)
	})
}

/** Участники, у которых имя или роль содержит запрос (запрос — в нижнем регистре) */
function filterMembers(members: ChatMember[], query: string): ChatMember[] {
	return members.filter(member => member.name.toLowerCase().includes(query) || (member.role && member.role.toLowerCase().includes(query)))
}

/** Команды, имя которых содержит запрос (запрос — в нижнем регистре) */
function filterCommands(commands: ChatCommand[], query: string): ChatCommand[] {
	return commands.filter(command => command.name.toLowerCase().includes(query))
}

/** Начальное состояние: списки скрыты, запросы пустые, активен первый пункт */
function createSuggestionState(): ChatSuggestionState {
	return {
		showMentions: ref(false),
		showCommands: ref(false),
		mentionQuery: ref(''),
		commandQuery: ref(''),
		activeSuggestionIndex: ref(0),
	}
}

/** Скрывает оба списка подсказок */
function hideSuggestions(state: ChatSuggestionState): void {
	state.showMentions.value = false
	state.showCommands.value = false
}

/** Показывает список участников (`@`) или команд (`/`) по слову перед кареткой, иначе скрывает подсказки */
function applyAutocompleteWord(state: ChatSuggestionState, word: string): void {
	const isMention = word.startsWith('@')
	if (!isMention && !word.startsWith('/')) {
		hideSuggestions(state)
		return
	}
	const shown = isMention ? state.showMentions : state.showCommands
	const hidden = isMention ? state.showCommands : state.showMentions
	if (!shown.value) state.activeSuggestionIndex.value = 0
	shown.value = true
	hidden.value = false
	const query = isMention ? state.mentionQuery : state.commandQuery
	query.value = word.slice(1).toLowerCase()
}

/** Открывает пустой список команд с первым активным пунктом */
function openCommandList(state: ChatSuggestionState): void {
	state.commandQuery.value = ''
	state.activeSuggestionIndex.value = 0
	state.showMentions.value = false
	state.showCommands.value = true
}

/** Индекс пункта после стрелки вниз или вверх (по кругу) или null для других клавиш */
function getNextSuggestionIndex(key: string, index: number, length: number): number | null {
	if (key === 'ArrowDown') return (index + 1) % length
	if (key === 'ArrowUp') return (index - 1 + length) % length
	return null
}

export {
	applyAutocompleteWord,
	createSuggestionState,
	filterCommands,
	filterMembers,
	focusCaretLater,
	getNextSuggestionIndex,
	getWordBeforeCaret,
	hideSuggestions,
	insertCommandTrigger,
	openCommandList,
	replaceWordBeforeCaret,
}
