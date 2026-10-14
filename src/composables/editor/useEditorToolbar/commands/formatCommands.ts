/** Утилиты: команды форматирования тулбара редактора (начертание, блоки, очистка, горячие клавиши) */
import { stripInlineStyle } from './colorCommands'
import { replaceCodeSelection } from '../helpers/codeText'
import { applyEdit, insertLineBreakCommand } from './editCommands'
import { ALIGN_MAP, FORMAT_CONFIG } from '@utils/dom/editorDomUtils'
import type { EditorAlign, EditorBlockTag } from '@utils/dom/editorBlockUtils'
import type { UseToolbarCommandsOptions } from '../types/useToolbarCommands.types'
import { removeInlineFormatting, toggleInlineFormat } from '@utils/dom/editorFormatUtils'
import { clearBlockFormatting, setAlign, setBlockTag, toggleList } from '@utils/dom/editorBlockUtils'

/**
 * Горячие клавиши форматирования: Ctrl (⌘ на macOS) + клавиша. Ключ — физическая клавиша (`event.code`),
 * поэтому сочетания работают в любой раскладке, в том числе в русской.
 */
const FORMAT_HOTKEYS: Readonly<Record<string, string | undefined>> = {
	KeyB: 'bold',
	KeyI: 'italic',
	KeyU: 'underline',
}

/** Команды списков визуального режима: вид списка */
const LIST_COMMANDS: ReadonlyMap<string, 'ol' | 'ul'> = new Map([
	['insertUnorderedList', 'ul'],
	['insertOrderedList', 'ol'],
])

/** Теги, в которые «Формат» превращает блоки */
const BLOCK_TAGS: ReadonlySet<string> = new Set(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'pre'])

/** Обёртки списков в режиме кода: открывающая и закрывающая части */
const LIST_CODE_WRAPS: ReadonlyMap<string, readonly [string, string]> = new Map([
	['insertUnorderedList', ['<ul>\n<li>', '</li>\n</ul>']],
	['insertOrderedList', ['<ol>\n<li>', '</li>\n</ol>']],
])

/** keyCode, который браузер ставит клавишам во время набора через IME */
const IME_KEY_CODE = 229

/** Команда форматирования для сочетания клавиш или undefined, если это не горячая клавиша редактора */
function getHotkeyCommand(event: KeyboardEvent): string | undefined {
	if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return undefined
	return FORMAT_HOTKEYS[event.code]
}

/** Начертание или список в режиме кода: оборачивает выделение тегами */
function wrapFormatInCode(ctx: UseToolbarCommandsOptions, command: string): void {
	const config = FORMAT_CONFIG[command]
	if (config) {
		ctx.wrapCodeSelection(`<${config.primary}>`, `</${config.primary}>`)
		return
	}
	const listWrap = LIST_CODE_WRAPS.get(command)
	if (listWrap) ctx.wrapCodeSelection(listWrap[0], listWrap[1])
}

/** Вид выделенных блоков по команде тулбара: выравнивание и списки; `null`, если команда не про блоки */
function blockCommand(command: string): ((root: HTMLElement) => boolean) | null {
	const align = ALIGN_MAP[command]
	if (align) return root => setAlign(root, align as EditorAlign)
	const list = LIST_COMMANDS.get(command)
	return list ? root => toggleList(root, list) : null
}

function applyFormat(ctx: UseToolbarCommandsOptions, command: string): void {
	if (ctx.isCodeMode.value) {
		wrapFormatInCode(ctx, command)
		return
	}
	const config = FORMAT_CONFIG[command]
	const block = blockCommand(command)
	if (config) applyEdit(ctx, root => toggleInlineFormat(root, { tag: config.primary, tags: config.match }))
	else if (block) applyEdit(ctx, block)
}

function applyBlockTag(ctx: UseToolbarCommandsOptions, tag: string, isToggle: boolean): void {
	if (BLOCK_TAGS.has(tag)) applyEdit(ctx, root => setBlockTag(root, tag as EditorBlockTag, isToggle))
}

function applyBlock(ctx: UseToolbarCommandsOptions, tag: string): void {
	if (ctx.isCodeMode.value) {
		ctx.wrapCodeSelection(`<${tag}>`, `</${tag}>`)
		return
	}
	applyBlockTag(ctx, tag, true)
}

function handleHeadingChange(ctx: UseToolbarCommandsOptions, value: string | number | (string | number)[]): void {
	const tag = String(value)
	if (!ctx.isCodeMode.value) applyBlockTag(ctx, tag, false)
	else if (tag === 'p') ctx.wrapCodeSelection('', '')
	else ctx.wrapCodeSelection(`<${tag}>`, `</${tag}>`)
}

/** Режим кода: убирает теги из выделенного фрагмента */
function clearCodeFormatting(ctx: UseToolbarCommandsOptions): void {
	const el = ctx.getCodeTextarea()
	if (!el) return
	replaceCodeSelection(el, ctx.codeContent, selected => selected.replace(/<[^>]*>/g, ''))
	ctx.onInput()
}

/** Визуальный режим: снимает начертание, цвета, блок и список */
function clearVisualFormatting(ctx: UseToolbarCommandsOptions): void {
	applyEdit(ctx, root => {
		removeInlineFormatting(root)
		stripInlineStyle(ctx, 'color')
		stripInlineStyle(ctx, 'backgroundColor')
		clearBlockFormatting(root)
		return true
	})
}

function handleKeyDown(ctx: UseToolbarCommandsOptions, event: KeyboardEvent): void {
	// Набор через IME (китайский, японский, корейский): Enter подтверждает вариант, а не переносит строку
	if (event.isComposing || event.keyCode === IME_KEY_CODE) return
	const hotkeyCommand = getHotkeyCommand(event)
	if (hotkeyCommand) {
		// Браузер сам переключает начертание по Ctrl+B/I/U: без preventDefault команда выполнилась бы дважды
		event.preventDefault()
		applyFormat(ctx, hotkeyCommand)
		return
	}
	// Enter без Shift — абзац или пункт списка по умолчанию браузера (разделитель абзацев задаёт defaultParagraphSeparator)
	if (event.key !== 'Enter' || !event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return
	event.preventDefault()
	insertLineBreakCommand(ctx)
}

export { applyBlock, applyFormat, clearCodeFormatting, clearVisualFormatting, handleHeadingChange, handleKeyDown }
