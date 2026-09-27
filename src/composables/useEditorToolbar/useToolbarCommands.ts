/** Composable: выполнение команд редактора (форматирование, блоки, цвет, медиа) */
import { nextTick } from 'vue'
import {
	FORMAT_CONFIG,
	isInsideList,
	matchTypedInlineTag,
} from '@utils/editorDomUtils'
import type { UseToolbarCommandsOptions } from './useToolbarCommands.types'

/**
 * Горячие клавиши форматирования: Ctrl (⌘ на macOS) + клавиша. Ключ — физическая клавиша (`event.code`),
 * поэтому сочетания работают в любой раскладке, в том числе в русской.
 */
const FORMAT_HOTKEYS: Readonly<Record<string, string | undefined>> = {
	KeyB: 'bold',
	KeyI: 'italic',
	KeyU: 'underline',
}

/** keyCode, который браузер ставит клавишам во время набора через IME */
const IME_KEY_CODE = 229

/** Команда форматирования для сочетания клавиш или undefined, если это не горячая клавиша редактора */
function getHotkeyCommand(event: KeyboardEvent): string | undefined {
	if (!(event.ctrlKey || event.metaKey) || event.shiftKey || event.altKey) return undefined
	return FORMAT_HOTKEYS[event.code]
}

/**
 * Composable для выполнения команд редактора: форматирование, блоки, цвет, медиа.
 */
function useToolbarCommands(options: UseToolbarCommandsOptions) {
	const {
		editorRef,
		onInput,
		updateActiveStates,
		saveSelection,
		restoreSelection,
		ensureSelection,
		isCodeMode,
		codeContent,
		wrapCodeSelection,
		insertCodeAtCursor,
		getCodeTextarea,
		promptForUrl,
	} = options

	function applyFormat(command: string): void {
		if (isCodeMode.value) {
			const config = FORMAT_CONFIG[command]
			if (config) {
				wrapCodeSelection(`<${config.primary}>`, `</${config.primary}>`)
				return
			}
			if (command === 'insertUnorderedList') {
				wrapCodeSelection('<ul>\n<li>', '</li>\n</ul>')
				return
			}
			if (command === 'insertOrderedList') {
				wrapCodeSelection('<ol>\n<li>', '</li>\n</ol>')
				return
			}
			return
		}
		ensureSelection()
		document.execCommand(command, false)
		saveSelection()
		nextTick(updateActiveStates)
		onInput()
	}

	function applyBlock(tag: string): void {
		if (isCodeMode.value) {
			wrapCodeSelection(`<${tag}>`, `</${tag}>`)
			return
		}
		ensureSelection()
		document.execCommand('formatBlock', false, tag)
		saveSelection()
		nextTick(updateActiveStates)
		onInput()
	}

	function handleHeadingChange(value: string | number | (string | number)[]): void {
		if (isCodeMode.value) {
			const tag = String(value)
			if (tag === 'p') {
				wrapCodeSelection('', '')
			} else {
				wrapCodeSelection(`<${tag}>`, `</${tag}>`)
			}
			return
		}
		ensureSelection()
		document.execCommand('formatBlock', false, String(value))
		saveSelection()
		nextTick(updateActiveStates)
		onInput()
	}

	function applyColor(color: string): void {
		if (isCodeMode.value) {
			wrapCodeSelection(`<span style="color:${color}">`, '</span>')
			return
		}
		restoreSelection()
		document.execCommand('foreColor', false, color)
		saveSelection()
		onInput()
	}

	function applyBackgroundColor(color: string): void {
		if (isCodeMode.value) {
			wrapCodeSelection(`<span style="background-color:${color}">`, '</span>')
			return
		}
		restoreSelection()
		document.execCommand('hiliteColor', false, color)
		saveSelection()
		onInput()
	}

	function stripInlineStyle(property: 'color' | 'backgroundColor'): void {
		const root = editorRef.value
		const sel = window.getSelection()
		if (!root || !sel || sel.rangeCount === 0) return
		const range = sel.getRangeAt(0)
		const styledElements = root.querySelectorAll<HTMLElement>('[style], font[color]')
		styledElements.forEach(element => {
			if (!range.intersectsNode(element)) return
			element.style.removeProperty(property === 'color' ? 'color' : 'background-color')
			if (element.tagName === 'FONT' && property === 'color') {
				element.removeAttribute('color')
			}
		})
	}

	function resetColor(): void {
		if (isCodeMode.value) {
			wrapCodeSelection('<span style="color:inherit">', '</span>')
			return
		}
		restoreSelection()
		stripInlineStyle('color')
		saveSelection()
		onInput()
	}

	function resetBackgroundColor(): void {
		if (isCodeMode.value) {
			wrapCodeSelection('<span style="background-color:transparent">', '</span>')
			return
		}
		restoreSelection()
		stripInlineStyle('backgroundColor')
		saveSelection()
		onInput()
	}

	function handleColorInput(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return
		applyColor(event.target.value)
	}

	function insertLink(): void {
		const url = promptForUrl?.()
		if (!url) return
		if (isCodeMode.value) {
			wrapCodeSelection(`<a href="${url}">`, '</a>')
			return
		}
		saveSelection()
		restoreSelection()
		document.execCommand('createLink', false, url)
		saveSelection()
		onInput()
	}

	function clearAllFormatting(): void {
		if (isCodeMode.value) {
			const el = getCodeTextarea()
			if (!el) return
			const start = el.selectionStart
			const end = el.selectionEnd
			const selected = codeContent.value.substring(start, end)
			const cleaned = selected.replace(/<[^>]*>/g, '')
			const before = codeContent.value.substring(0, start)
			const after = codeContent.value.substring(end)
			codeContent.value = before + cleaned + after
			el.focus()
			onInput()
			return
		}
		ensureSelection()
		document.execCommand('removeFormat', false)
		stripInlineStyle('color')
		stripInlineStyle('backgroundColor')
		document.execCommand('formatBlock', false, 'p')
		const sel = window.getSelection()
		const node = sel?.anchorNode ?? null
		if (isInsideList(node, editorRef.value!, 'UL')) {
			document.execCommand('insertUnorderedList', false)
		}
		if (isInsideList(node, editorRef.value!, 'OL')) {
			document.execCommand('insertOrderedList', false)
		}
		saveSelection()
		nextTick(updateActiveStates)
		onInput()
	}

	function insertSeparator(): void {
		if (isCodeMode.value) {
			insertCodeAtCursor('<hr>')
			return
		}
		ensureSelection()
		document.execCommand('insertHTML', false, '<hr>')
		saveSelection()
		onInput()
	}

	function handleKeyDown(event: KeyboardEvent): void {
		// Набор через IME (китайский, японский, корейский): Enter подтверждает вариант, а не переносит строку
		if (event.isComposing || event.keyCode === IME_KEY_CODE) return
		const hotkeyCommand = getHotkeyCommand(event)
		if (hotkeyCommand) {
			// Браузер сам переключает начертание по Ctrl+B/I/U: без preventDefault команда выполнилась бы дважды
			event.preventDefault()
			applyFormat(hotkeyCommand)
			return
		}
		if (event.key !== 'Enter' || event.shiftKey) return
		const sel = window.getSelection()
		const node = sel?.anchorNode ?? null
		const inList = isInsideList(node, editorRef.value!, 'UL') || isInsideList(node, editorRef.value!, 'OL')
		if (inList) return
		event.preventDefault()
		document.execCommand('insertHTML', false, '<br>')
		nextTick(updateActiveStates)
		onInput()
	}

	function handleImageUpload(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return
		if (!event.target.files?.length) return
		const file = event.target.files[0]
		const url = URL.createObjectURL(file)
		if (isCodeMode.value) {
			insertCodeAtCursor(`<img src="${url}" alt="" />`)
			event.target.value = ''
			return
		}
		restoreSelection()
		// Не insertImage: он не задаёт alt, и скринридер читает вместо изображения адрес blob:…
		// Изображение без описания помечается как оформление (alt=""), как и в режиме кода; описание автор добавит в HTML.
		// url — адрес blob:, созданный браузером, кавычек в нём нет.
		document.execCommand('insertHTML', false, `<img src="${url}" alt="">`)
		saveSelection()
		event.target.value = ''
		onInput()
	}

	function handleVideoUpload(event: Event): void {
		if (!(event.target instanceof HTMLInputElement)) return
		if (!event.target.files?.length) return
		const file = event.target.files[0]
		const url = URL.createObjectURL(file)
		if (isCodeMode.value) {
			insertCodeAtCursor(`<video src="${url}" controls style="max-width:100%;border-radius:8px;"></video><br/>`)
			event.target.value = ''
			return
		}
		const html = `<video src="${url}" controls style="max-width:100%;border-radius:8px;"></video><br/>`
		restoreSelection()
		document.execCommand('insertHTML', false, html)
		saveSelection()
		event.target.value = ''
		onInput()
	}

	/**
	 * Превращает только что набранную пару `<b>текст</b>` в элемент форматирования.
	 * Узлы собираются через DOM API (createElement + textContent), а не через innerHTML:
	 * текст абзаца мог прийти из modelValue в экранированном виде (`&lt;img onerror…&gt;`)
	 * или из буфера обмена, и разбор его как HTML исполнил бы чужую разметку.
	 */
	function convertInlineHtml(): void {
		const root = editorRef.value
		if (!root) return

		const sel = window.getSelection()
		if (!sel || sel.rangeCount === 0) return

		const node = sel.anchorNode
		if (!node || !(node instanceof Text) || !root.contains(node)) return

		const text = node.textContent ?? ''
		// Ищем пару только прямо перед кареткой: ввод в любом другом месте абзаца
		// не должен менять ранее сохранённый текст, где теги записаны буквально
		const caret = Math.min(sel.anchorOffset, text.length)
		const typed = matchTypedInlineTag(text.slice(0, caret))
		if (!typed) return

		const element = document.createElement(typed.tag)
		element.textContent = typed.content
		const fragment = document.createDocumentFragment()
		const textBefore = text.slice(0, typed.start)
		const textAfter = text.slice(caret)
		if (textBefore) fragment.appendChild(document.createTextNode(textBefore))
		fragment.appendChild(element)
		if (textAfter) fragment.appendChild(document.createTextNode(textAfter))

		// Узел лежит внутри root (проверено выше), поэтому родитель у него есть — replaceWith заменяет его на месте
		node.replaceWith(fragment)

		const range = document.createRange()
		range.setStartAfter(element)
		range.collapse(true)
		sel.removeAllRanges()
		sel.addRange(range)

		onInput()
	}

	return {
		applyFormat,
		applyBlock,
		handleHeadingChange,
		applyColor,
		applyBackgroundColor,
		resetColor,
		resetBackgroundColor,
		handleColorInput,
		insertLink,
		clearAllFormatting,
		insertSeparator,
		handleKeyDown,
		handleImageUpload,
		handleVideoUpload,
		convertInlineHtml,
	}
}

export { useToolbarCommands }
