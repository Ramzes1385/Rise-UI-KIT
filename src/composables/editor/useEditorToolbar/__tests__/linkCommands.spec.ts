import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useEditorToolbar } from '../useEditorToolbar'
import type { UseToolbarCommandsOptions } from '../types/useToolbarCommands.types'
import { applyLink, getSelectionPoint, readLinkAtSelection, removeLink, resolveLinkUrl } from '../commands/linkCommands'

function createContext(html: string, overrides: Partial<UseToolbarCommandsOptions> = {}) {
	const editor = document.createElement('div')
	editor.innerHTML = html
	document.body.appendChild(editor)
	const ctx = {
		editorRef: ref<HTMLDivElement | null>(editor),
		onInput: vi.fn(),
		updateActiveStates: vi.fn(),
		saveSelection: vi.fn(),
		restoreSelection: vi.fn(() => true),
		ensureSelection: vi.fn(),
		isCodeMode: ref(false),
		codeContent: ref(''),
		wrapCodeSelection: vi.fn(),
		insertCodeAtCursor: vi.fn(),
		getCodeTextarea: vi.fn((): HTMLTextAreaElement | null => null),
		...overrides,
	} as unknown as UseToolbarCommandsOptions
	return { editor, ctx }
}

function selectText(node: Node, start: number, end: number): void {
	const range = document.createRange()
	range.setStart(node, start)
	range.setEnd(node, end)
	const selection = window.getSelection()
	selection?.removeAllRanges()
	selection?.addRange(range)
}

function mockRect(element: Element, rect: Partial<DOMRect>): void {
	vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ left: 0, top: 0, bottom: 0, width: 0, height: 0, ...rect } as DOMRect)
}

describe('linkCommands', () => {
	beforeEach(() => {
		Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true })
		Range.prototype.getClientRects = vi.fn(() => [] as unknown as DOMRectList)
		Range.prototype.getBoundingClientRect = vi.fn(() => ({ left: 0, bottom: 0, width: 0, height: 0 }) as DOMRect)
	})

	afterEach(() => {
		vi.restoreAllMocks()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('resolveLinkUrl', () => {
		it.each([
			['example.com', 'https://example.com'],
			['  http://a.test/x ', 'http://a.test/x'],
			['team@example.com', 'mailto:team@example.com'],
			['/docs', '/docs'],
		])('%s → %s', (input, expected) => {
			expect(resolveLinkUrl(input)).toBe(expected)
		})

		it.each(['', '   ', 'javascript:alert(1)', 'data:text/html,x', 'JaVaScRiPt:alert(1)'])('отклоняет «%s»', input => {
			expect(resolveLinkUrl(input)).toBeNull()
		})
	})

	describe('обходы проверки адреса', () => {
		it.each(['JAVASCRIPT:alert(1)', '  javascript:alert(1)', 'vbscript:msgbox(1)', 'VBScript:msgbox(1)', ' data:text/html;base64,AA'])(
			'отклоняет «%s»',
			input => {
				expect(resolveLinkUrl(input)).toBeNull()
			},
		)

		it.each([
			'java\tscript:alert(1)',
			'java\nscript:alert(1)',
			'\u0001javascript:alert(1)',
			'\u0000javascript:alert(1)',
			'%6Aavascript:alert(1)',
			'javascript&colon;alert(1)',
			'jav&#x09;ascript:alert(1)',
		])('%j не становится исполняемой схемой: адрес отклонён либо остаётся «https://…»', input => {
			const url = resolveLinkUrl(input)
			expect(url === null || url.startsWith('https://')).toBe(true)
			expect(decodeURIComponent(url ?? '')).not.toMatch(/^(javascript|vbscript|data):/i)
		})
	})

	describe('readLinkAtSelection', () => {
		it('возвращает адрес и признак новой вкладки у ссылки под выделением', () => {
			const { editor, ctx } = createContext('<p><a href="https://a.test" target="_blank">ссылка</a> и текст</p>')
			selectText(editor.querySelector('a')!.firstChild!, 0, 3)

			expect(readLinkAtSelection(ctx)).toEqual({ url: 'https://a.test', isNewTab: true })
			expect(ctx.ensureSelection).toHaveBeenCalled()
		})

		it('у ссылки без href и target адрес пустой, новая вкладка выключена', () => {
			const { editor, ctx } = createContext('<p><a>ссылка</a></p>')
			selectText(editor.querySelector('a')!.firstChild!, 0, 1)

			expect(readLinkAtSelection(ctx)).toEqual({ url: '', isNewTab: false })
		})

		it('вне ссылки, в режиме кода и без области — null', () => {
			const { editor, ctx } = createContext('<p>просто текст</p>')
			selectText(editor.querySelector('p')!.firstChild!, 0, 3)
			expect(readLinkAtSelection(ctx)).toBeNull()

			ctx.isCodeMode.value = true
			expect(readLinkAtSelection(ctx)).toBeNull()

			ctx.isCodeMode.value = false
			window.getSelection()?.removeAllRanges()
			expect(readLinkAtSelection(ctx)).toBeNull()

			ctx.editorRef.value = null
			expect(readLinkAtSelection(ctx)).toBeNull()
		})
	})

	describe('getSelectionPoint', () => {
		it('точка под видимым выделением', () => {
			const { editor, ctx } = createContext('<p>текст</p>')
			selectText(editor.querySelector('p')!.firstChild!, 0, 2)
			Range.prototype.getClientRects = vi.fn(() => [{ left: 40, bottom: 90, width: 20, height: 18 }] as unknown as DOMRectList)

			expect(getSelectionPoint(ctx)).toEqual({ x: 40, y: 90 })
		})

		it('выделение без клиентских прямоугольников берёт ограничивающий прямоугольник', () => {
			const { editor, ctx } = createContext('<p>текст</p>')
			selectText(editor.querySelector('p')!.firstChild!, 0, 2)
			Range.prototype.getBoundingClientRect = vi.fn(() => ({ left: 5, bottom: 7, width: 3, height: 4 }) as DOMRect)

			expect(getSelectionPoint(ctx)).toEqual({ x: 5, y: 7 })
		})

		it('среда без измерения диапазонов (jsdom) не ломает открытие диалога', () => {
			const { editor, ctx } = createContext('<p>текст</p>')
			mockRect(editor, { left: 2, top: 3 })
			selectText(editor.querySelector('p')!.firstChild!, 0, 2)
			Range.prototype.getClientRects = undefined as never
			Range.prototype.getBoundingClientRect = undefined as never

			expect(getSelectionPoint(ctx)).toEqual({ x: 2, y: 27 })
		})

		it('невидимое выделение и отсутствие выделения — угол области ввода со сдвигом', () => {
			const { editor, ctx } = createContext('<p>текст</p>')
			mockRect(editor, { left: 12, top: 100 })
			selectText(editor.querySelector('p')!.firstChild!, 1, 1)
			expect(getSelectionPoint(ctx)).toEqual({ x: 12, y: 124 })

			window.getSelection()?.removeAllRanges()
			expect(getSelectionPoint(ctx)).toEqual({ x: 12, y: 124 })
		})

		it('режим кода — угол поля кода, нет поля — начало координат со сдвигом', () => {
			const textarea = document.createElement('textarea')
			mockRect(textarea, { left: 30, top: 50 })
			const { ctx } = createContext('', { getCodeTextarea: vi.fn(() => textarea) })
			ctx.isCodeMode.value = true
			expect(getSelectionPoint(ctx)).toEqual({ x: 30, y: 74 })

			ctx.getCodeTextarea = vi.fn(() => null)
			expect(getSelectionPoint(ctx)).toEqual({ x: 0, y: 24 })
		})
	})

	describe('applyLink', () => {
		it('в режиме кода оборачивает выделение тегом ссылки, адрес экранируется', () => {
			const { ctx } = createContext('')
			ctx.isCodeMode.value = true

			applyLink(ctx, { url: 'https://a.test/?a=1&b="2"', isNewTab: false })
			applyLink(ctx, { url: 'https://a.test', isNewTab: true })

			expect(ctx.wrapCodeSelection).toHaveBeenNthCalledWith(1, '<a href="https://a.test/?a=1&amp;b=&quot;2&quot;">', '</a>')
			expect(ctx.wrapCodeSelection).toHaveBeenNthCalledWith(
				2,
				'<a href="https://a.test" target="_blank" rel="noopener noreferrer">',
				'</a>',
			)
			expect(document.execCommand).not.toHaveBeenCalled()
		})

		it('без области ничего не делает', () => {
			const { ctx } = createContext('<p>текст</p>')
			ctx.editorRef.value = null
			applyLink(ctx, { url: 'https://a.test', isNewTab: false })
			expect(document.execCommand).not.toHaveBeenCalled()
			expect(ctx.onInput).not.toHaveBeenCalled()
		})

		it('без сохранённого выделения ставит адрес ссылкой в конец содержимого, а не закрывает диалог молча', () => {
			const { editor, ctx } = createContext('<p>текст</p>')
			ctx.restoreSelection = vi.fn(() => false)

			applyLink(ctx, { url: 'https://a.test', isNewTab: true })

			const range = window.getSelection()!.getRangeAt(0)
			expect(range.collapsed).toBe(true)
			expect(range.startContainer).toBe(editor)
			expect(document.execCommand).toHaveBeenCalledWith(
				'insertHTML',
				false,
				'<a href="https://a.test" target="_blank" rel="noopener noreferrer">https://a.test</a>',
			)
			expect(ctx.onInput).toHaveBeenCalledTimes(1)
		})

		it('выделенный текст оборачивается в ссылку командой createLink, новая вкладка помечает ссылку', () => {
			const { editor, ctx } = createContext('<p>один два <a href="https://old.test">три</a></p>')
			const text = editor.querySelector('p')!.firstChild!
			vi.mocked(document.execCommand).mockImplementation((command, _ui, value) => {
				if (command !== 'createLink') return true
				const link = document.createElement('a')
				link.href = String(value)
				window.getSelection()!.getRangeAt(0).surroundContents(link)
				return true
			})
			selectText(text, 0, 4)
			vi.spyOn(window.getSelection()!, 'containsNode').mockImplementation(
				node => (node as Element).getAttribute('href') === 'https://a.test',
			)

			applyLink(ctx, { url: 'https://a.test', isNewTab: true })

			const link = editor.querySelector('a')!
			expect(document.execCommand).toHaveBeenCalledWith('createLink', false, 'https://a.test')
			expect(link).toHaveAttribute('target', '_blank')
			expect(link).toHaveAttribute('rel', 'noopener noreferrer')
			expect(editor.querySelectorAll('a')[1]).not.toHaveAttribute('target')
			expect(ctx.saveSelection).toHaveBeenCalled()
			expect(ctx.onInput).toHaveBeenCalled()
		})

		it('пустое выделение вставляет ссылку с адресом как текстом', () => {
			const { editor, ctx } = createContext('<p>текст</p>')
			selectText(editor.querySelector('p')!.firstChild!, 2, 2)

			applyLink(ctx, { url: 'https://a.test/?a=1&b=2', isNewTab: true })

			expect(document.execCommand).toHaveBeenCalledWith(
				'insertHTML',
				false,
				'<a href="https://a.test/?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">https://a.test/?a=1&amp;b=2</a>',
			)
			expect(ctx.onInput).toHaveBeenCalled()
		})

		it('каретка или выделение внутри ссылки правит эту ссылку, а не создаёт новую', () => {
			const { editor, ctx } = createContext('<p><a href="https://old.test">ссылка</a></p>')
			const link = editor.querySelector('a')!
			selectText(link.firstChild!, 1, 3)

			applyLink(ctx, { url: 'https://new.test', isNewTab: true })
			expect(link).toHaveAttribute('href', 'https://new.test')
			expect(link).toHaveAttribute('target', '_blank')

			applyLink(ctx, { url: 'https://new.test', isNewTab: false })
			expect(link).not.toHaveAttribute('target')
			expect(link).not.toHaveAttribute('rel')
			expect(document.execCommand).not.toHaveBeenCalled()
		})

		it('чужой rel при снятии «новой вкладки» остаётся', () => {
			const { editor, ctx } = createContext('<p><a href="https://old.test" target="_blank" rel="nofollow">ссылка</a></p>')
			selectText(editor.querySelector('a')!.firstChild!, 0, 2)

			applyLink(ctx, { url: 'https://old.test', isNewTab: false })

			expect(editor.querySelector('a')).toHaveAttribute('rel', 'nofollow')
			expect(editor.querySelector('a')).not.toHaveAttribute('target')
		})
	})

	describe('removeLink', () => {
		it('разворачивает ссылку и оставляет её текст выделенным', () => {
			const { editor, ctx } = createContext('<p>до <a href="https://a.test">ссылка <b>жирная</b></a> после</p>')
			selectText(editor.querySelector('a')!.firstChild!, 0, 2)

			removeLink(ctx)

			expect(editor.querySelector('a')).toBeNull()
			expect(editor.innerHTML).toBe('<p>до ссылка <b>жирная</b> после</p>')
			expect(window.getSelection()?.toString()).toBe('ссылка жирная')
			expect(ctx.onInput).toHaveBeenCalled()
			expect(ctx.saveSelection).toHaveBeenCalled()
		})

		it('пустая ссылка просто исчезает', () => {
			const { editor, ctx } = createContext('<p>до <a href="https://a.test"></a> после</p>')
			const link = editor.querySelector('a')!
			window.getSelection()?.collapse(link, 0)

			removeLink(ctx)

			expect(editor.querySelector('a')).toBeNull()
			expect(ctx.onInput).toHaveBeenCalled()
		})

		it('выделение вне одной ссылки снимает ссылки командой unlink', () => {
			const { editor, ctx } = createContext('<p>просто текст</p>')
			selectText(editor.querySelector('p')!.firstChild!, 0, 5)

			removeLink(ctx)

			expect(document.execCommand).toHaveBeenCalledWith('unlink', false)
			expect(ctx.onInput).toHaveBeenCalled()
		})

		it('в режиме кода и без сохранённого выделения ничего не делает', () => {
			const { ctx } = createContext('<p>текст</p>')
			ctx.isCodeMode.value = true
			removeLink(ctx)

			ctx.isCodeMode.value = false
			ctx.restoreSelection = vi.fn(() => false)
			removeLink(ctx)

			expect(document.execCommand).not.toHaveBeenCalled()
			expect(ctx.onInput).not.toHaveBeenCalled()
		})
	})
})

describe('useEditorToolbar: команды ссылки', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	it('отдаёт проверку адреса, чтение, вставку, снятие и точку ссылки', () => {
		Object.defineProperty(document, 'execCommand', { value: vi.fn(() => true), configurable: true, writable: true })
		Range.prototype.getClientRects = vi.fn(() => [{ left: 3, bottom: 4, width: 1, height: 1 }] as unknown as DOMRectList)
		const editor = document.createElement('div')
		editor.innerHTML = '<p><a href="https://a.test">ссылка</a></p>'
		document.body.appendChild(editor)
		const onInput = vi.fn()
		let toolbar!: ReturnType<typeof useEditorToolbar>
		mount({
			setup() {
				toolbar = useEditorToolbar({ editorRef: ref(editor), codeTextareaRef: ref(null), onInput })
				return () => null
			},
		})
		const text = editor.querySelector('a')!.firstChild!
		const range = document.createRange()
		range.setStart(text, 0)
		range.setEnd(text, 2)
		window.getSelection()?.removeAllRanges()
		window.getSelection()?.addRange(range)
		toolbar.saveSelection()

		expect(toolbar.resolveLinkUrl('a.test')).toBe('https://a.test')
		expect(toolbar.readLink()).toEqual({ url: 'https://a.test', isNewTab: false })
		expect(toolbar.getLinkPoint()).toEqual({ x: 3, y: 4 })
		toolbar.applyLink({ url: 'https://b.test', isNewTab: true })
		expect(editor.querySelector('a')).toHaveAttribute('href', 'https://b.test')
		toolbar.removeLink()
		expect(editor.querySelector('a')).toBeNull()
		expect(onInput).toHaveBeenCalledTimes(2)
	})
})
