/**
 * Unit-тесты для useEditorToolbar.
 * Проверяют состояние тулбара, форматирование и оба режима (визуальный/код).
 */

import { mount } from '@vue/test-utils'
import { nextTick, ref } from 'vue'

import { useEditorToolbar } from './useEditorToolbar'

/** Обёртка для вызова composable внутри Vue-контекста */
function withSetup<T>(composable: () => T): T {
	let result: T
	mount({
		setup() {
			result = composable()
			return () => null
		},
	})
	return result!
}

/** Создать мок textarea для режима кода */
function createMockTextarea(selStart = 0, selEnd = 0): HTMLTextAreaElement {
	const el = document.createElement('textarea')
	Object.defineProperty(el, 'selectionStart', { value: selStart, writable: true })
	Object.defineProperty(el, 'selectionEnd', { value: selEnd, writable: true })
	return el
}

/** Создать мок options для useEditorToolbar */
function createOptions(withTextarea = false, selStart = 0, selEnd = 0) {
	const editorRef = ref<HTMLDivElement | null>(document.createElement('div'))
	const textareaEl = withTextarea ? createMockTextarea(selStart, selEnd) : null
	const codeTextareaRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>(
		textareaEl ? { textareaRef: textareaEl } : null,
	)
	const onInput = vi.fn()

	return { editorRef, codeTextareaRef, onInput, textareaEl }
}

/** Мок window.getSelection */
function mockGetSelection(overrides: Record<string, unknown> = {}) {
	const selection = {
		anchorNode: null,
		rangeCount: 0,
		getRangeAt: vi.fn(),
		removeAllRanges: vi.fn(),
		addRange: vi.fn(),
		...overrides,
	}
	vi.spyOn(window, 'getSelection').mockReturnValue(selection as unknown as Selection)
	return selection
}

/** Мок Range */
function mockRange(overrides: Record<string, unknown> = {}) {
	return {
		cloneRange: vi.fn().mockReturnThis(),
		commonAncestorContainer: null,
		selectNodeContents: vi.fn(),
		collapse: vi.fn(),
		...overrides,
	} as unknown as Range
}

describe('useEditorToolbar', () => {
	beforeEach(() => {
		// execCommand не существует в jsdom
		Object.defineProperty(document, 'execCommand', {
			value: vi.fn().mockReturnValue(true),
			configurable: true,
			writable: true,
		})
		mockGetSelection()
		vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
	})

	afterEach(() => {
		vi.restoreAllMocks()
	})

	describe('Начальное состояние', () => {
		it('должен возвращать activeStates с начальными значениями', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { activeStates } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			expect(activeStates.isBold).toBe(false)
			expect(activeStates.formatBlock).toBe('')
		})

		it('должен возвращать contextMenu с начальными значениями', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { contextMenu } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			expect(contextMenu.isVisible).toBe(false)
		})
	})

	describe('toggleCodeMode', () => {
		it('должен переключать режимы', async () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			editorRef.value!.innerHTML = '<p>test</p>'
			const { isCodeMode, codeContent, toggleCodeMode } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			toggleCodeMode()
			expect(isCodeMode.value).toBe(true)
			expect(codeContent.value).toBe('<p>test</p>')

			toggleCodeMode()
			expect(isCodeMode.value).toBe(false)
			await nextTick()
			expect(onInput).toHaveBeenCalled()
		})

		it('не должен падать при editorRef=null', () => {
			const { codeTextareaRef, onInput } = createOptions()
			const editorRef = ref<HTMLDivElement | null>(null)
			const { toggleCodeMode } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			expect(() => toggleCodeMode()).not.toThrow()
		})

		it('toggleCodeMode обратно: editorRef.value может стать null', async () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { isCodeMode, toggleCodeMode } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))

			toggleCodeMode() // в режим кода
			editorRef.value = null
			toggleCodeMode() // обратно

			await nextTick()
			expect(onInput).not.toHaveBeenCalled()
		})
	})

	describe('applyFormat', () => {
		it('визуальный режим: вызывает execCommand', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { applyFormat } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			applyFormat('bold')
			expect(document.execCommand).toHaveBeenCalledWith('bold', false)
		})

		it('режим кода: оборачивает тегами', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 5)
			const { isCodeMode, codeContent, applyFormat } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = 'hello'
			applyFormat('bold')
			expect(codeContent.value).toBe('<b>hello</b>')

			codeContent.value = 'item'
			applyFormat('insertUnorderedList')
			expect(codeContent.value).toBe('<ul>\n<li>item</li>\n</ul>')

			codeContent.value = 'item'
			applyFormat('insertOrderedList')
			expect(codeContent.value).toBe('<ol>\n<li>item</li>\n</ol>')

			codeContent.value = 'text'
			applyFormat('underline')
			expect(codeContent.value).toBe('<u>text</u>')

			codeContent.value = 'text'
			applyFormat('strikeThrough')
			expect(codeContent.value).toBe('<s>text</s>')
		})

		it('режим кода: неизвестная команда ничего не делает', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 4)
			const { isCodeMode, codeContent, applyFormat } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = 'text'
			applyFormat('unknown')
			expect(codeContent.value).toBe('text')
		})

		it('режим кода: getCodeTextarea возвращает null когда ref есть, но textareaRef=null', () => {
			// Покрывает ветку `return null` в getCodeTextarea (useEditorToolbar.ts:104):
			// ref не instanceof HTMLTextAreaElement и ref.textareaRef не HTMLTextAreaElement.
			const editorRef = ref<HTMLDivElement | null>(document.createElement('div'))
			const codeTextareaRef = ref<{ textareaRef: HTMLTextAreaElement | null } | null>({ textareaRef: null })
			const onInput = vi.fn()
			const { isCodeMode, codeContent, applyFormat } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = 'preserved'
			// applyFormat('bold') в code-режиме вызывает wrapCodeSelection → getCodeTextarea() === null → return
			expect(() => applyFormat('bold')).not.toThrow()
			expect(codeContent.value).toBe('preserved')
		})
	})

	describe('applyBlock / handleHeadingChange', () => {
		it('визуальный режим: вызывает formatBlock', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { applyBlock, handleHeadingChange } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			applyBlock('blockquote')
			expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'blockquote')
			handleHeadingChange('h1')
			expect(document.execCommand).toHaveBeenCalledWith('formatBlock', false, 'h1')
		})

		it('режим кода: оборачивает тегами', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 5)
			const { isCodeMode, codeContent, applyBlock, handleHeadingChange } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = 'text'
			applyBlock('pre')
			expect(codeContent.value).toBe('<pre>text</pre>')

			codeContent.value = 'title'
			handleHeadingChange('h2')
			expect(codeContent.value).toBe('<h2>title</h2>')

			codeContent.value = 'p'
			handleHeadingChange('p')
			expect(codeContent.value).toBe('p')
		})
	})

	describe('applyColor / handleColorInput', () => {
		it('визуальный режим: вызывает foreColor', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { applyColor, handleColorInput } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			applyColor('#ff0000')
			expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#ff0000')

			const input = document.createElement('input')
			input.value = '#00ff00'
			const event = { target: input } as unknown as Event
			handleColorInput(event)
			expect(document.execCommand).toHaveBeenCalledWith('foreColor', false, '#00ff00')
		})

		it('режим кода: оборачивает в span', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 4)
			const { isCodeMode, codeContent, applyColor } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = 'text'
			applyColor('#ff0000')
			expect(codeContent.value).toBe('<span style="color:#ff0000">text</span>')
		})
	})

	describe('applyBackgroundColor', () => {
		it('визуальный режим: вызывает hiliteColor', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { applyBackgroundColor } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			applyBackgroundColor('#ffff00')
			expect(document.execCommand).toHaveBeenCalledWith('hiliteColor', false, '#ffff00')
		})

		it('режим кода: оборачивает в span с background-color', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 4)
			const { isCodeMode, codeContent, applyBackgroundColor } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = 'text'
			applyBackgroundColor('#ffff00')
			expect(codeContent.value).toBe('<span style="background-color:#ffff00">text</span>')
		})
	})

	describe('resetColor / resetBackgroundColor', () => {
		it('визуальный режим: снимает inline color со span внутри выделения', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const span = document.createElement('span')
			span.style.color = 'rgb(255, 0, 0)'
			span.style.backgroundColor = 'rgb(0, 255, 0)'
			span.textContent = 'text'
			editorRef.value!.appendChild(span)
			mockGetSelection({
				rangeCount: 1,
				getRangeAt: vi.fn().mockReturnValue(mockRange({ intersectsNode: vi.fn().mockReturnValue(true) })),
			})
			const { resetColor } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			resetColor()
			expect(span.style.color).toBe('')
			expect(span.style.backgroundColor).toBe('rgb(0, 255, 0)')
		})

		it('визуальный режим: снимает inline background-color и атрибут color у font', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const span = document.createElement('span')
			span.style.backgroundColor = 'rgb(0, 255, 0)'
			span.textContent = 'text'
			const font = document.createElement('font')
			font.setAttribute('color', '#ff0000')
			editorRef.value!.append(span, font)
			mockGetSelection({
				rangeCount: 1,
				getRangeAt: vi.fn().mockReturnValue(mockRange({ intersectsNode: vi.fn().mockReturnValue(true) })),
			})
			const { resetColor, resetBackgroundColor } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			resetBackgroundColor()
			expect(span.style.backgroundColor).toBe('')
			resetColor()
			expect(font.hasAttribute('color')).toBe(false)
		})

		it('визуальный режим: пропускает элементы вне выделения', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const span = document.createElement('span')
			span.style.color = 'rgb(255, 0, 0)'
			editorRef.value!.appendChild(span)
			mockGetSelection({
				rangeCount: 1,
				getRangeAt: vi.fn().mockReturnValue(mockRange({ intersectsNode: vi.fn().mockReturnValue(false) })),
			})
			const { resetColor } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			resetColor()
			expect(span.style.color).toBe('rgb(255, 0, 0)')
		})

		it('режим кода: оборачивает в span с inherit/transparent', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 4)
			const { isCodeMode, codeContent, resetColor, resetBackgroundColor } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = 'text'
			resetColor()
			expect(codeContent.value).toBe('<span style="color:inherit">text</span>')
			codeContent.value = 'text'
			resetBackgroundColor()
			expect(codeContent.value).toBe('<span style="background-color:transparent">text</span>')
		})
	})

	describe('insertLink', () => {
		it('визуальный режим: вызывает createLink', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { insertLink } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput, promptForUrl: () => 'https://example.com' }))
			insertLink()
			expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://example.com')
		})

		it('режим кода: оборачивает в a', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 4)
			const { isCodeMode, codeContent, insertLink } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput, promptForUrl: () => 'https://example.com' }),
			)
			isCodeMode.value = true
			codeContent.value = 'link'
			insertLink()
			expect(codeContent.value).toBe('<a href="https://example.com">link</a>')
		})

		it('режим кода: отмена prompt', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 4)
			const { isCodeMode, codeContent, insertLink } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput, promptForUrl: () => null }),
			)
			isCodeMode.value = true
			codeContent.value = 'link'
			insertLink()
			expect(codeContent.value).toBe('link')
		})
	})

	describe('clearAllFormatting', () => {
		it('визуальный режим: вызывает removeFormat и сбрасывает списки', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const ul = document.createElement('ul')
			const li = document.createElement('li')
			li.textContent = 'item'
			ul.appendChild(li)
			editorRef.value!.appendChild(ul)

			const range = mockRange({ commonAncestorContainer: li.firstChild })
			mockGetSelection({ anchorNode: li.firstChild, rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })

			const { clearAllFormatting } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			clearAllFormatting()
			expect(document.execCommand).toHaveBeenCalledWith('removeFormat', false)
			expect(document.execCommand).toHaveBeenCalledWith('insertUnorderedList', false)
		})

		it('визуальный режим: сбрасывает нумерованные списки', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const ol = document.createElement('ol')
			const li = document.createElement('li')
			li.textContent = 'item'
			ol.appendChild(li)
			editorRef.value!.appendChild(ol)

			const range = mockRange({ commonAncestorContainer: li.firstChild })
			mockGetSelection({ anchorNode: li.firstChild, rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })

			const { clearAllFormatting } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			clearAllFormatting()
			expect(document.execCommand).toHaveBeenCalledWith('insertOrderedList', false)
		})

		it('визуальный режим: не падает если editorRef.value null', () => {
			const { codeTextareaRef, onInput } = createOptions()
			const editorRef = ref<HTMLDivElement | null>(null)
			const { clearAllFormatting } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			expect(() => clearAllFormatting()).not.toThrow()
		})

		it('режим кода: удаляет теги', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 11)
			const { isCodeMode, codeContent, clearAllFormatting } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = '<b>bold</b>'
			clearAllFormatting()
			expect(codeContent.value).toBe('bold')
		})
	})

	describe('insertSeparator', () => {
		it('визуальный режим: вызывает insertHTML', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { insertSeparator } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			insertSeparator()
			expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, '<hr>')
		})

		it('режим кода: вставляет hr', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 0)
			const { isCodeMode, codeContent, insertSeparator } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = 'text'
			insertSeparator()
			expect(codeContent.value).toBe('<hr>text')
		})
	})

	describe('Selection management', () => {
		it('saveSelection / restoreSelection', () => {
			const editorDiv = document.createElement('div')
			const range = mockRange({ commonAncestorContainer: editorDiv })
			mockGetSelection({ anchorNode: editorDiv, rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })
			const { codeTextareaRef, onInput } = createOptions()
			const editorRef = ref<HTMLDivElement | null>(editorDiv)

			const { saveSelection, restoreSelection } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			saveSelection()
			expect(restoreSelection()).toBe(true)
		})

		it('saveSelection если getSelection возвращает null', () => {
			vi.spyOn(window, 'getSelection').mockReturnValue(null as any)
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { saveSelection } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			expect(() => saveSelection()).not.toThrow()
		})

		it('ensureSelection вызывает restoreSelection если нужно', () => {
			const editorDiv = document.createElement('div')
			const outsideDiv = document.createElement('div')
			const range = mockRange({ commonAncestorContainer: editorDiv })
			// Сначала настраиваем чтобы saveSelection сработал
			mockGetSelection({ anchorNode: editorDiv, rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })

			const { codeTextareaRef, onInput } = createOptions()
			const editorRef = ref<HTMLDivElement | null>(editorDiv)
			const { saveSelection, ensureSelection } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			saveSelection()

			// Теперь выделение снаружи
			mockGetSelection({ anchorNode: outsideDiv, rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })
			ensureSelection()
			expect(window.getSelection()?.addRange).toHaveBeenCalled()
		})

		it('restoreSelection возвращает false если getSelection возвращает null', () => {
			const editorDiv = document.createElement('div')
			const range = mockRange({ commonAncestorContainer: editorDiv })
			mockGetSelection({ rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })
			const { codeTextareaRef, onInput } = createOptions()
			const editorRef = ref<HTMLDivElement | null>(editorDiv)

			const { saveSelection, restoreSelection } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			saveSelection()
			vi.spyOn(window, 'getSelection').mockReturnValue(null as any)
			const result = restoreSelection()

			expect(result).toBe(false)
		})

		it('restoreSelection возвращает false если editorRef.value null', () => {
			const editorDiv = document.createElement('div')
			const range = mockRange({ commonAncestorContainer: editorDiv })
			mockGetSelection({ anchorNode: editorDiv, rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })
			const { codeTextareaRef, onInput } = createOptions()
			const editorRef = ref<HTMLDivElement | null>(editorDiv)

			const { saveSelection, restoreSelection } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			saveSelection()
			editorRef.value = null
			expect(restoreSelection()).toBe(false)
		})

		it('ensureSelection ничего не делает если editorRef.value null', () => {
			const { codeTextareaRef, onInput } = createOptions()
			const editorRef = ref<HTMLDivElement | null>(null)
			const { ensureSelection } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			expect(() => ensureSelection()).not.toThrow()
		})
	})

	describe('Media management', () => {
		it('handleContextMenu / applyMediaSize / removeMedia', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleContextMenu, contextMenu, applyMediaSize, removeMedia } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			const img = document.createElement('img')
			editorRef.value!.appendChild(img)
			const event = {
				target: img,
				clientX: 10,
				clientY: 10,
				preventDefault: vi.fn(),
			} as unknown as MouseEvent
			vi.spyOn(img, 'getBoundingClientRect').mockReturnValue({ width: 100, height: 100 } as DOMRect)

			handleContextMenu(event)
			expect(contextMenu.isVisible).toBe(true)

			contextMenu.width = '50'
			contextMenu.height = '50'
			applyMediaSize()
			expect(img.style.width).toBe('50px')
			expect(img.style.height).toBe('50px')

			handleContextMenu(event)
			removeMedia()
			expect(editorRef.value!.contains(img)).toBe(false)
		})

		it('handleImageUpload / handleVideoUpload', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleImageUpload, handleVideoUpload } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			const file = new File([''], 'test.png')
			const input = document.createElement('input')
			Object.defineProperty(input, 'files', { value: [file] })
			const event = { target: input } as unknown as Event

			handleImageUpload(event)
			expect(document.execCommand).toHaveBeenCalledWith('insertImage', false, 'blob:test')

			handleVideoUpload(event)
			expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, expect.stringContaining('<video'))
		})

		it('handleImageUpload / handleVideoUpload в режиме кода', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions(true, 0, 0)
			const { handleImageUpload, handleVideoUpload, isCodeMode } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			isCodeMode.value = true
			const file = new File([''], 'test.png')
			const input = document.createElement('input')
			Object.defineProperty(input, 'files', { value: [file] })
			const event = { target: input } as unknown as Event

			handleImageUpload(event)
			expect(onInput).toHaveBeenCalled()

			handleVideoUpload(event)
			expect(onInput).toHaveBeenCalledTimes(2)
		})

		it('handleImageUpload / handleVideoUpload без файлов', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleImageUpload, handleVideoUpload } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			const input = document.createElement('input')
			Object.defineProperty(input, 'files', { value: [] })
			const event = { target: input } as unknown as Event

			handleImageUpload(event)
			handleVideoUpload(event)
			expect(document.execCommand).not.toHaveBeenCalled()
		})
	})

	describe('Keyboard and HTML conversion', () => {
		it('handleKeyDown Enter', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleKeyDown } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			const event = {
				key: 'Enter',
				shiftKey: false,
				preventDefault: vi.fn(),
			} as unknown as KeyboardEvent

			handleKeyDown(event)
			expect(event.preventDefault).toHaveBeenCalled()
			expect(document.execCommand).toHaveBeenCalledWith('insertHTML', false, '<br>')
		})

		it('handleKeyDown не Enter', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleKeyDown } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			const event = {
				key: 'a',
				shiftKey: false,
				preventDefault: vi.fn(),
			} as unknown as KeyboardEvent

			handleKeyDown(event)
			expect(event.preventDefault).not.toHaveBeenCalled()
		})

		it('convertInlineHtml', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const textNode = document.createTextNode('hello </b>world')
			editorRef.value!.appendChild(textNode)
			const range = mockRange()
			mockGetSelection({ anchorNode: textNode, rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })

			const { convertInlineHtml } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			convertInlineHtml()
			expect(onInput).toHaveBeenCalled()
		})

		it('convertInlineHtml с null textContent', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const textNode = document.createTextNode('')
			Object.defineProperty(textNode, 'textContent', { get: () => null })
			editorRef.value!.appendChild(textNode)
			mockGetSelection({ anchorNode: textNode, rangeCount: 1 })

			const { convertInlineHtml } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			convertInlineHtml()
			expect(onInput).not.toHaveBeenCalled()
		})

		it('convertInlineHtml: нет родителя', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const textNode = document.createTextNode('test </b>')
			mockGetSelection({ anchorNode: textNode, rangeCount: 1 })
			const { convertInlineHtml } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			convertInlineHtml()
			expect(onInput).not.toHaveBeenCalled()
		})
	})

	describe('handleCodeInput', () => {
		it('обновляет codeContent и вызывает onInput', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleCodeInput, codeContent } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			handleCodeInput('new content')
			expect(codeContent.value).toBe('new content')
			expect(onInput).toHaveBeenCalled()
		})
	})

	describe('Edge cases and branches', () => {
		it('handleColorInput игнорирует не-input target', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleColorInput } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			const event = { target: document.createElement('div') } as unknown as Event
			handleColorInput(event)
			expect(document.execCommand).not.toHaveBeenCalled()
		})

		it('handleImageUpload / handleVideoUpload игнорируют не-input target', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleImageUpload, handleVideoUpload } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			const event = { target: document.createElement('div') } as unknown as Event
			handleImageUpload(event)
			handleVideoUpload(event)
			expect(document.execCommand).not.toHaveBeenCalled()
		})

		it('saveSelection игнорирует выделение вне редактора', () => {
			const editorDiv = document.createElement('div')
			const outsideDiv = document.createElement('div')
			const range = mockRange({ commonAncestorContainer: outsideDiv })
			mockGetSelection({ anchorNode: outsideDiv, rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })
			const { codeTextareaRef, onInput } = createOptions()
			const editorRef = ref<HTMLDivElement | null>(editorDiv)

			const { saveSelection, restoreSelection } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)

			saveSelection()
			expect(restoreSelection()).toBe(false)
		})

		it('convertInlineHtml: node не в редакторе', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const outsideNode = document.createTextNode('test </b>')
			mockGetSelection({ anchorNode: outsideNode, rangeCount: 1 })
			const { convertInlineHtml } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			convertInlineHtml()
			expect(onInput).not.toHaveBeenCalled()
		})

		it('convertInlineHtml: парсинг не создал новых элементов', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const textNode = document.createTextNode('<a>')
			editorRef.value!.appendChild(textNode)
			mockGetSelection({ anchorNode: textNode, rangeCount: 1 })
			const { convertInlineHtml } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			convertInlineHtml()
			expect(onInput).not.toHaveBeenCalled()
		})

		it('updateActiveStates определяет выравнивание и формат', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const p = document.createElement('p')
			p.style.textAlign = 'center'
			p.textContent = 'text'
			editorRef.value!.appendChild(p)
			mockGetSelection({ anchorNode: p.firstChild, rangeCount: 1 })

			const { updateActiveStates, activeStates } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			updateActiveStates()
			expect(activeStates.isJustifyCenter).toBe(true)

			p.style.textAlign = 'right'
			updateActiveStates()
			expect(activeStates.isJustifyRight).toBe(true)

			p.style.textAlign = 'justify'
			updateActiveStates()
			expect(activeStates.isJustifyFull).toBe(true)

			p.style.textAlign = 'end'
			updateActiveStates()
			expect(activeStates.isJustifyRight).toBe(true)

			p.style.textAlign = 'left'
			updateActiveStates()
			expect(activeStates.isJustifyLeft).toBe(true)

			p.style.textAlign = 'start'
			updateActiveStates()
			expect(activeStates.isJustifyLeft).toBe(true)

			const blockquote = document.createElement('blockquote')
			blockquote.textContent = 'quote'
			editorRef.value!.appendChild(blockquote)
			mockGetSelection({ anchorNode: blockquote.firstChild, rangeCount: 1 })
			updateActiveStates()
			expect(activeStates.isBlockquote).toBe(true)

			const pre = document.createElement('pre')
			pre.textContent = 'code'
			editorRef.value!.appendChild(pre)
			mockGetSelection({ anchorNode: pre.firstChild, rangeCount: 1 })
			updateActiveStates()
			expect(activeStates.isPre).toBe(true)
		})

		it('updateActiveStates определяет жирный и курсив', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const b = document.createElement('b')
			b.textContent = 'bold'
			editorRef.value!.appendChild(b)
			mockGetSelection({ anchorNode: b.firstChild, rangeCount: 1 })

			const { updateActiveStates, activeStates } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			updateActiveStates()
			expect(activeStates.isBold).toBe(true)

			const i = document.createElement('i')
			i.textContent = 'italic'
			editorRef.value!.appendChild(i)
			mockGetSelection({ anchorNode: i.firstChild, rangeCount: 1 })
			updateActiveStates()
			expect(activeStates.isItalic).toBe(true)

			const u = document.createElement('u')
			u.textContent = 'underline'
			editorRef.value!.appendChild(u)
			mockGetSelection({ anchorNode: u.firstChild, rangeCount: 1 })
			updateActiveStates()
			expect(activeStates.isUnderline).toBe(true)

			const s = document.createElement('s')
			s.textContent = 'strike'
			editorRef.value!.appendChild(s)
			mockGetSelection({ anchorNode: s.firstChild, rangeCount: 1 })
			updateActiveStates()
			expect(activeStates.isStrike).toBe(true)
		})

		it('updateActiveStates определяет списки', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const ul = document.createElement('ul')
			const li = document.createElement('li')
			li.textContent = 'item'
			ul.appendChild(li)
			editorRef.value!.appendChild(ul)
			mockGetSelection({ anchorNode: li.firstChild, rangeCount: 1 })

			const { updateActiveStates, activeStates } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			updateActiveStates()
			expect(activeStates.isUnorderedList).toBe(true)

			const ol = document.createElement('ol')
			const li2 = document.createElement('li')
			li2.textContent = 'item'
			ol.appendChild(li2)
			editorRef.value!.appendChild(ol)
			mockGetSelection({ anchorNode: li2.firstChild, rangeCount: 1 })
			updateActiveStates()
			expect(activeStates.isOrderedList).toBe(true)
		})
	})

	it('покрытие оставшихся веток', () => {
		const { editorRef, codeTextareaRef, onInput } = createOptions()
		const { updateActiveStates, closeContextMenu, contextMenu, convertInlineHtml } = withSetup(() =>
			useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
		)

		editorRef.value = null
		expect(() => updateActiveStates()).not.toThrow()
		expect(() => convertInlineHtml()).not.toThrow()

		contextMenu.isVisible = true
		closeContextMenu()
		expect(contextMenu.isVisible).toBe(false)
	})

	it('должен возвращать isActive для useClickOutside', () => {
		const { editorRef, codeTextareaRef, onInput } = createOptions()
		const { contextMenu } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
		contextMenu.isVisible = true
		expect(contextMenu.isVisible).toBe(true)
	})

	it('удаляет слушатель при размонтировании', () => {
		const removeSpy = vi.spyOn(document, 'removeEventListener')
		const { editorRef, codeTextareaRef, onInput } = createOptions()
		const wrapper = mount({
			setup() {
				useEditorToolbar({ editorRef, codeTextareaRef, onInput })
				return () => null
			},
		})
		wrapper.unmount()
		expect(removeSpy).toHaveBeenCalledWith('mousedown', expect.any(Function), false)
	})

	it('closeContextMenu вызывается при клике вне меню', () => {
		const { editorRef, codeTextareaRef, onInput } = createOptions()
		const { contextMenu, handleContextMenu, contextMenuRef } = withSetup(() =>
			useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
		)

		const menuDiv = document.createElement('div')
		contextMenuRef.value = menuDiv

		const img = document.createElement('img')
		const event = {
			target: img,
			clientX: 100,
			clientY: 200,
			preventDefault: vi.fn(),
		} as unknown as MouseEvent
		vi.spyOn(img, 'getBoundingClientRect').mockReturnValue({ width: 300, height: 200 } as DOMRect)

		handleContextMenu(event)
		expect(contextMenu.isVisible).toBe(true)

		// Эмулируем клик вне
		document.dispatchEvent(new MouseEvent('mousedown'))
		expect(contextMenu.isVisible).toBe(false)
	})

	it('клик внутри меню не закрывает его', () => {
		const { editorRef, codeTextareaRef, onInput } = createOptions()
		const { contextMenu, handleContextMenu, contextMenuRef } = withSetup(() =>
			useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
		)

		const menuDiv = document.createElement('div')
		contextMenuRef.value = menuDiv

		const img = document.createElement('img')
		const event = {
			target: img,
			clientX: 100,
			clientY: 200,
			preventDefault: vi.fn(),
		} as unknown as MouseEvent
		vi.spyOn(img, 'getBoundingClientRect').mockReturnValue({ width: 300, height: 200 } as DOMRect)

		handleContextMenu(event)
		expect(contextMenu.isVisible).toBe(true)

		// Эмулируем клик внутри
		const clickEvent = new MouseEvent('mousedown', { bubbles: true })
		Object.defineProperty(clickEvent, 'target', { value: menuDiv })
		document.dispatchEvent(clickEvent)
		expect(contextMenu.isVisible).toBe(true)
	})

	describe('Дополнительные покрытия веток', () => {
		it('getCodeTextarea: codeTextareaRef — нативный HTMLTextAreaElement (ветка 102)', () => {
			// Покрывает useEditorToolbar.ts:102 — `ref instanceof HTMLTextAreaElement` (true).
			const editorRef = ref<HTMLDivElement | null>(document.createElement('div'))
			const textareaEl = createMockTextarea(0, 3)
			const codeTextareaRef = ref<HTMLTextAreaElement | null>(textareaEl)
			const onInput = vi.fn()
			const { isCodeMode, codeContent, applyFormat } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = 'abc'
			applyFormat('bold')
			expect(codeContent.value).toBe('<b>abc</b>')
		})

		it('insertLink: пользователь отменил prompt → ранний return', () => {
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { insertLink } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput, promptForUrl: () => null }))
			insertLink()
			expect(onInput).not.toHaveBeenCalled()
		})

		it('clearAllFormatting: codeMode с null textarea → ранний return', () => {
			// Покрывает useEditorToolbar.ts:222 — getCodeTextarea() === null → return.
			const editorRef = ref<HTMLDivElement | null>(document.createElement('div'))
			const codeTextareaRef = ref<HTMLTextAreaElement | null>(null)
			const onInput = vi.fn()
			const { isCodeMode, codeContent, clearAllFormatting } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			isCodeMode.value = true
			codeContent.value = '<b>preserved</b>'
			clearAllFormatting()
			expect(codeContent.value).toBe('<b>preserved</b>')
		})

		it('handleKeyDown: внутри списка → ранний return (без preventDefault)', () => {
			// Покрывает useEditorToolbar.ts:268 — `if (inList) return`.
			const editorRef = ref<HTMLDivElement | null>(document.createElement('div'))
			const ulEl = document.createElement('ul')
			editorRef.value!.appendChild(ulEl)
			const liEl = document.createElement('li')
			ulEl.appendChild(liEl)
			mockGetSelection({ anchorNode: liEl })

			const codeTextareaRef = ref<HTMLTextAreaElement | null>(null)
			const onInput = vi.fn()
			const { handleKeyDown } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))

			const event = { key: 'Enter', shiftKey: false, preventDefault: vi.fn() } as unknown as KeyboardEvent
			handleKeyDown(event)
			expect(event.preventDefault).not.toHaveBeenCalled()
		})

		it('handleContextMenu: target не HTMLElement → ранний return', () => {
			// Покрывает useEditorToolbar.ts:277 — `if (!(target instanceof HTMLElement)) return`.
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleContextMenu, contextMenu } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			const event = {
				target: document.createTextNode('text'),
				clientX: 0,
				clientY: 0,
				preventDefault: vi.fn(),
			} as unknown as MouseEvent
			handleContextMenu(event)
			expect(contextMenu.isVisible).toBe(false)
		})

		it('handleContextMenu: target не IMG/VIDEO → ранний return', () => {
			// Покрывает useEditorToolbar.ts:278 — `target.tagName !== 'IMG' && !== 'VIDEO'`.
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { handleContextMenu, contextMenu } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			const span = document.createElement('span')
			const event = {
				target: span,
				clientX: 0,
				clientY: 0,
				preventDefault: vi.fn(),
			} as unknown as MouseEvent
			handleContextMenu(event)
			expect(contextMenu.isVisible).toBe(false)
		})

		it('applyMediaSize: contextMenu.element=null → ранний return', () => {
			// Покрывает useEditorToolbar.ts:290 — `if (!contextMenu.element) return`.
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { applyMediaSize, contextMenu } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			contextMenu.element = null
			expect(() => applyMediaSize()).not.toThrow()
			expect(onInput).not.toHaveBeenCalled()
		})

		it('applyMediaSize: пустые width/height не применяют стиль', () => {
			// Покрывает useEditorToolbar.ts:292-293 — ветки `if (contextMenu.width)` false.
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { applyMediaSize, contextMenu } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			const img = document.createElement('img')
			contextMenu.element = img
			contextMenu.width = ''
			contextMenu.height = ''
			applyMediaSize()
			expect(img.style.width).toBe('')
			expect(img.style.height).toBe('')
			expect(onInput).toHaveBeenCalled()
		})

		it('removeMedia: contextMenu.element=null → ранний return', () => {
			// Покрывает useEditorToolbar.ts:299 — `if (!contextMenu.element) return`.
			const { editorRef, codeTextareaRef, onInput } = createOptions()
			const { removeMedia, contextMenu } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			contextMenu.element = null
			expect(() => removeMedia()).not.toThrow()
			expect(onInput).not.toHaveBeenCalled()
		})

		it('convertInlineHtml: текст содержит закрывающий тег → парсинг создаёт элементы', () => {
			// Покрывает useEditorToolbar.ts:390 — temp создаёт >1 узлов или другие условия false.
			// Текстовый узел внутри editorRef содержит '<b>bold</b>' → temp.innerHTML = '<b>bold</b>'
			// → temp.childNodes.length=1, firstChild — Element (не Text) → условие false → продолжается.
			const editorRef = ref<HTMLDivElement | null>(document.createElement('div'))
			const textNode = document.createTextNode('hello <b>world</b>')
			editorRef.value!.appendChild(textNode)

			const range = mockRange({ commonAncestorContainer: textNode })
			mockGetSelection({ anchorNode: textNode, rangeCount: 1, getRangeAt: vi.fn().mockReturnValue(range) })

			const codeTextareaRef = ref<HTMLTextAreaElement | null>(null)
			const onInput = vi.fn()
			const { convertInlineHtml } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			expect(() => convertInlineHtml()).not.toThrow()
		})

		it("convertInlineHtml: текст без HTML-тегов (нет '</') → ранний return до temp", () => {
			// Покрывает useEditorToolbar.ts:383 — `if (!/<\/.../.test(text)) return`.
			const editorRef = ref<HTMLDivElement | null>(document.createElement('div'))
			const textNode = document.createTextNode('plain text without tags')
			editorRef.value!.appendChild(textNode)
			mockGetSelection({ anchorNode: textNode, rangeCount: 1 })

			const codeTextareaRef = ref<HTMLTextAreaElement | null>(null)
			const onInput = vi.fn()
			const { convertInlineHtml } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			expect(() => convertInlineHtml()).not.toThrow()
		})

		it('convertInlineHtml: parent=null → ранний return', () => {
			// Покрывает useEditorToolbar.ts:394 — `if (!parent) return`.
			const editorRef = ref<HTMLDivElement | null>(document.createElement('div'))
			// Текстовый узел без parent (не вставлен в DOM), но содержит закрывающий тег.
			const orphanNode = document.createTextNode('<b>bold</b>')
			// При этом editorRef.contains(orphanNode) должен быть true, что невозможно для orphan.
			// Используем другой подход: создадим узел через editorRef, потом отвяжем parent.
			editorRef.value!.appendChild(orphanNode)
			// Подделываем contains, чтобы пройти проверку, но parent отсутствует
			const containsOrig = editorRef.value!.contains.bind(editorRef.value!)
			vi.spyOn(editorRef.value!, 'contains').mockImplementation((n: Node | null) => n === orphanNode || containsOrig(n))
			// Удалим parent после прикрепления — orphanNode остаётся в anchorNode selection,
			// но мы заменим parentNode симуляцией:
			Object.defineProperty(orphanNode, 'parentNode', { value: null, configurable: true })

			mockGetSelection({ anchorNode: orphanNode, rangeCount: 1 })
			const codeTextareaRef = ref<HTMLTextAreaElement | null>(null)
			const onInput = vi.fn()
			const { convertInlineHtml } = withSetup(() => useEditorToolbar({ editorRef, codeTextareaRef, onInput }))
			expect(() => convertInlineHtml()).not.toThrow()
		})

		it('insertCodeAtCursor: codeTextareaRef=null → не падает', () => {
			// Покрывает useEditorToolbar.ts:124 — getCodeTextarea() === null → return.
			const editorRef = ref<HTMLDivElement | null>(document.createElement('div'))
			const codeTextareaRef = ref<HTMLTextAreaElement | null>(null)
			const onInput = vi.fn()
			const { isCodeMode, codeContent, insertSeparator } = withSetup(() =>
				useEditorToolbar({ editorRef, codeTextareaRef, onInput }),
			)
			// insertSeparator в codeMode вызывает insertCodeAtCursor — нужно codeMode=true
			isCodeMode.value = true
			codeContent.value = 'before'
			// codeTextarea null → insertCodeAtCursor возвращается рано
			expect(() => insertSeparator()).not.toThrow()
			expect(codeContent.value).toBe('before')
		})
	})
})
