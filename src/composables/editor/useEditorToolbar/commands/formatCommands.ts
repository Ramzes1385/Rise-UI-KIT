/** Утилиты: команды форматирования тулбара редактора (начертание, блоки, очистка, горячие клавиши) */
import { stripInlineStyle } from './colorCommands'
import { replaceCodeSelection } from '../helpers/codeText'
import { FORMAT_CONFIG, isInsideList } from '@utils/dom/editorDomUtils'
import { commitVisualChange, insertLineBreakCommand } from './editCommands'
import type { UseToolbarCommandsOptions } from '../types/useToolbarCommands.types'

/**
 * Горячие клавиши форматирования: Ctrl (⌘ на macOS) + клавиша. Ключ — физическая клавиша (`event.code`),
 * поэтому сочетания работают в любой раскладке, в том числе в русской.
 */
const FORMAT_HOTKEYS: Readonly<Record<string, string | undefined>> = {
	KeyB: 'bold',
	KeyI: 'italic',
	KeyU: 'underline',
}

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

/** Узел, в котором стоит каретка */
function getCaretNode(): Node | null {
	return window.getSelection()?.anchorNode ?? null
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

function applyFormat(ctx: UseToolbarCommandsOptions, command: string): void {
	if (ctx.isCodeMode.value) {
		wrapFormatInCode(ctx, command)
		return
	}
	ctx.ensureSelection()
	ctx.onBeforeChange?.()
	document.execCommand(command, false)
	commitVisualChange(ctx)
}

function applyBlock(ctx: UseToolbarCommandsOptions, tag: string): void {
	if (ctx.isCodeMode.value) {
		ctx.wrapCodeSelection(`<${tag}>`, `</${tag}>`)
		return
	}
	ctx.ensureSelection()
	ctx.onBeforeChange?.()
	document.execCommand('formatBlock', false, tag)
	commitVisualChange(ctx)
}

function handleHeadingChange(ctx: UseToolbarCommandsOptions, value: string | number | (string | number)[]): void {
	if (ctx.isCodeMode.value) {
		const tag = String(value)
		if (tag === 'p') {
			ctx.wrapCodeSelection('', '')
		} else {
			ctx.wrapCodeSelection(`<${tag}>`, `</${tag}>`)
		}
		return
	}
	ctx.ensureSelection()
	ctx.onBeforeChange?.()
	document.execCommand('formatBlock', false, String(value))
	commitVisualChange(ctx)
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
	ctx.ensureSelection()
	ctx.onBeforeChange?.()
	document.execCommand('removeFormat', false)
	stripInlineStyle(ctx, 'color')
	stripInlineStyle(ctx, 'backgroundColor')
	document.execCommand('formatBlock', false, 'p')
	const node = getCaretNode()
	if (isInsideList(node, ctx.editorRef.value!, 'UL')) document.execCommand('insertUnorderedList', false)
	if (isInsideList(node, ctx.editorRef.value!, 'OL')) document.execCommand('insertOrderedList', false)
	commitVisualChange(ctx)
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
