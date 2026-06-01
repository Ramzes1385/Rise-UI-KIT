import { nextTick, reactive, ref } from 'vue'

import { useClickOutside } from '@composables/useClickOutside'

import {
	FORMAT_CONFIG,
	getBlockAlign,
	getFormatBlock,
	isInsideList,
	isInsideTags,
} from '@utils/editorDomInspect'
import type { EditorActiveStates, MediaContextMenuState, UseEditorToolbarOptions } from './useEditorToolbar.types'

function useEditorToolbar(options: UseEditorToolbarOptions) {
	const { editorRef, codeTextareaRef, onInput } = options
	const activeStates = reactive<EditorActiveStates>({
		isBold: false,
		isItalic: false,
		isUnderline: false,
		isStrike: false,
		isJustifyLeft: false,
		isJustifyCenter: false,
		isJustifyRight: false,
		isJustifyFull: false,
		isUnorderedList: false,
		isOrderedList: false,
		isBlockquote: false,
		isPre: false,
		formatBlock: '',
	})
	const contextMenu = reactive<MediaContextMenuState>({
		isVisible: false,
		x: 0,
		y: 0,
		element: null,
		width: '',
		height: '',
	})
	const contextMenuRef = ref<HTMLElement | null>(null)
	const isCodeMode = ref(false)
	const codeContent = ref('')
	let savedRange: Range | null = null

	function updateActiveStates(): void {
		const sel = window.getSelection()
		const node = sel?.anchorNode ?? null
		const root = editorRef.value
		if (!root) return

		activeStates.isBold = isInsideTags(node, FORMAT_CONFIG.bold.match, root)
		activeStates.isItalic = isInsideTags(node, FORMAT_CONFIG.italic.match, root)
		activeStates.isUnderline = isInsideTags(node, FORMAT_CONFIG.underline.match, root)
		activeStates.isStrike = isInsideTags(node, FORMAT_CONFIG.strikeThrough.match, root)

		const align = getBlockAlign(node, root)
		activeStates.isJustifyLeft = align === 'left'
		activeStates.isJustifyCenter = align === 'center'
		activeStates.isJustifyRight = align === 'right'
		activeStates.isJustifyFull = align === 'justify'

		activeStates.isUnorderedList = isInsideList(node, root, 'UL')
		activeStates.isOrderedList = isInsideList(node, root, 'OL')

		const block = getFormatBlock(node, root)
		activeStates.formatBlock = block
		activeStates.isBlockquote = block === 'blockquote'
		activeStates.isPre = block === 'pre'
	}

	function saveSelection(): void {
		const sel = window.getSelection()
		if (!sel || sel.rangeCount === 0 || !editorRef.value) return
		const range = sel.getRangeAt(0)
		if (editorRef.value.contains(range.commonAncestorContainer)) {
			savedRange = range.cloneRange()
		}
		updateActiveStates()
	}

	function restoreSelection(): boolean {
		if (!savedRange || !editorRef.value) return false
		editorRef.value.focus()
		const sel = window.getSelection()
		if (!sel) return false
		sel.removeAllRanges()
		sel.addRange(savedRange)
		return true
	}

	function ensureSelection(): void {
		if (!editorRef.value) return
		const sel = window.getSelection()
		if (!sel || !editorRef.value.contains(sel.anchorNode)) {
			restoreSelection()
		}
	}

	/** Получить внутренний textarea — поддерживает как BaseTextarea, так и нативный элемент */
	function getCodeTextarea(): HTMLTextAreaElement | null {
		const ref = codeTextareaRef.value
		if (!ref) return null
		if (ref instanceof HTMLTextAreaElement) return ref
		if ('textareaRef' in ref && ref.textareaRef instanceof HTMLTextAreaElement) return ref.textareaRef
		return null
	}

	/** Обернуть выделение в textarea HTML-тегом в режиме кода */
	function wrapCodeSelection(openTag: string, closeTag: string): void {
		const el = getCodeTextarea()
		if (!el) return
		const start = el.selectionStart
		const end = el.selectionEnd
		const selected = codeContent.value.substring(start, end)
		const before = codeContent.value.substring(0, start)
		const after = codeContent.value.substring(end)
		codeContent.value = before + openTag + selected + closeTag + after
		el.focus()
		onInput()
	}

	/** Вставить HTML в позицию курсора textarea в режиме кода */
	function insertCodeAtCursor(html: string): void {
		const el = getCodeTextarea()
		if (!el) return
		const pos = el.selectionStart
		const before = codeContent.value.substring(0, pos)
		const after = codeContent.value.substring(el.selectionEnd)
		codeContent.value = before + html + after
		el.focus()
		onInput()
	}

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

	/** Снять inline-стиль (color/background-color) с элементов внутри выделения */
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

	/** Сбросить цвет текста выделения к значению по умолчанию */
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

	/** Сбросить цвет фона выделения к значению по умолчанию */
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
		if (isCodeMode.value) {
			const url = prompt('Введите URL ссылки:')
			if (!url) return
			wrapCodeSelection(`<a href="${url}">`, '</a>')
			return
		}
		saveSelection()
		const url = prompt('Введите URL ссылки:')
		if (!url) return
		restoreSelection()
		document.execCommand('createLink', false, url)
		saveSelection()
		onInput()
	}

	/** Полная очистка inline и блочного форматирования */
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

	/** Вставить разделитель (HR) */
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

	/** Перехват Enter для сохранения форматирования */
	function handleKeyDown(event: KeyboardEvent): void {
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

	function handleContextMenu(event: MouseEvent): void {
		const target = event.target
		if (!(target instanceof HTMLElement)) return
		if (target.tagName !== 'IMG' && target.tagName !== 'VIDEO') return
		event.preventDefault()
		contextMenu.isVisible = true
		contextMenu.x = event.clientX
		contextMenu.y = event.clientY
		contextMenu.element = target
		const rect = target.getBoundingClientRect()
		contextMenu.width = String(Math.round(rect.width))
		contextMenu.height = String(Math.round(rect.height))
	}

	function applyMediaSize(): void {
		if (!contextMenu.element) return
		const el = contextMenu.element
		if (contextMenu.width) el.style.width = contextMenu.width + 'px'
		if (contextMenu.height) el.style.height = contextMenu.height + 'px'
		closeContextMenu()
		onInput()
	}

	function removeMedia(): void {
		if (!contextMenu.element) return
		contextMenu.element.remove()
		closeContextMenu()
		onInput()
	}

	function closeContextMenu(): void {
		contextMenu.isVisible = false
		contextMenu.element = null
		contextMenu.width = ''
		contextMenu.height = ''
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
		document.execCommand('insertImage', false, url)
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

	/** Переключение в режим кода */
	function toggleCodeMode(): void {
		if (!isCodeMode.value) {
			if (!editorRef.value) return
			codeContent.value = editorRef.value.innerHTML
			isCodeMode.value = true
		} else {
			isCodeMode.value = false
			nextTick(() => {
				if (!editorRef.value) return
				editorRef.value.innerHTML = codeContent.value
				onInput()
			})
		}
	}

	/** Обработка ввода в режиме кода */
	function handleCodeInput(value: string): void {
		codeContent.value = value
		onInput()
	}

	/** Конвертировать HTML-теги в текстовых узлах в реальные DOM-элементы */
	function convertInlineHtml(): void {
		const root = editorRef.value
		if (!root) return

		const sel = window.getSelection()
		if (!sel || sel.rangeCount === 0) return

		const node = sel.anchorNode
		if (!node || !(node instanceof Text) || !root.contains(node)) return

		const text = node.textContent ?? ''

		// Проверяем наличие закрывающего HTML-тега
		if (!/<\/[a-zA-Z][a-zA-Z0-9]*\s*>/.test(text)) return

		// Парсим текст как HTML
		const temp = document.createElement('div')
		temp.innerHTML = text

		// Если парсинг не создал элементов — нечего конвертировать
		/* istanbul ignore next — edge-case innerHTML-парсинга: текст проходит regex `</tag>`, но браузер парсит как одиночный Text-узел; достижимо только при специфической нестандартной разметке */
		if (temp.childNodes.length === 1 && temp.firstChild instanceof Text && temp.firstChild.textContent === text) return

		// Заменяем текстовый узел на распарсенный контент
		const parent = node.parentNode
		if (!parent) return

		const fragment = document.createDocumentFragment()
		while (temp.firstChild) {
			fragment.appendChild(temp.firstChild)
		}

		parent.replaceChild(fragment, node)

		// Восстанавливаем курсор в конец изменённого блока
		const range = document.createRange()
		range.selectNodeContents(parent)
		range.collapse(false)
		sel.removeAllRanges()
		sel.addRange(range)

		onInput()
	}

	useClickOutside({
		targets: [contextMenuRef],
		callback: closeContextMenu,
		isActive: () => contextMenu.isVisible,
	})

	return {
		activeStates,
		contextMenu,
		contextMenuRef,
		isCodeMode,
		codeContent,
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
		toggleCodeMode,
		handleCodeInput,
		handleContextMenu,
		applyMediaSize,
		removeMedia,
		closeContextMenu,
		saveSelection,
		restoreSelection,
		updateActiveStates,
		handleKeyDown,
		handleImageUpload,
		handleVideoUpload,
		ensureSelection,
		convertInlineHtml,
	}
}

export { useEditorToolbar }

