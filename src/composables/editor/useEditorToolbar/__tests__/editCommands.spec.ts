import '@testing-library/jest-dom/vitest'
import { nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useEditorToolbar } from '../useEditorToolbar'
import type { EditorEditContext, UseToolbarCommandsOptions } from '../types/useToolbarCommands.types'
import { applyEdit, commitVisualChange, deleteSelectionCommand, insertHtmlCommand, insertLineBreakCommand } from '../commands/editCommands'

function createContext(html: string) {
	const editor = document.createElement('div')
	editor.setAttribute('contenteditable', 'true')
	editor.innerHTML = html
	document.body.appendChild(editor)
	const ctx = {
		editorRef: ref<HTMLDivElement | null>(editor),
		ensureSelection: vi.fn(),
		saveSelection: vi.fn(),
		updateActiveStates: vi.fn(),
		onInput: vi.fn(),
	}
	return { editor, ctx }
}

function caretAt(node: Node, offset: number): void {
	const range = document.createRange()
	range.setStart(node, offset)
	range.collapse(true)
	window.getSelection()?.removeAllRanges()
	window.getSelection()?.addRange(range)
}

describe('editCommands', () => {
	afterEach(() => {
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	it('commitVisualChange сохраняет выделение, сообщает о вводе и обновляет активные форматы', async () => {
		const { ctx } = createContext('<p>a</p>')

		commitVisualChange(ctx as unknown as EditorEditContext)
		await nextTick()

		expect(ctx.saveSelection).toHaveBeenCalledTimes(1)
		expect(ctx.onInput).toHaveBeenCalledTimes(1)
		expect(ctx.updateActiveStates).toHaveBeenCalledTimes(1)
	})

	describe('applyEdit', () => {
		it('без области ничего не делает', () => {
			const { ctx } = createContext('<p>a</p>')
			ctx.editorRef.value = null
			const change = vi.fn(() => true)

			expect(applyEdit(ctx as unknown as EditorEditContext, change)).toBe(false)

			expect(change).not.toHaveBeenCalled()
			expect(ctx.onInput).not.toHaveBeenCalled()
		})

		it('без выделения ставит каретку в конец содержимого и фокусирует область', () => {
			const { editor, ctx } = createContext('<p>a</p>')
			let caret: Node | null = null

			applyEdit(ctx as unknown as EditorEditContext, () => {
				caret = window.getSelection()?.anchorNode ?? null
				return true
			})

			expect(ctx.ensureSelection).toHaveBeenCalledTimes(1)
			expect(caret).toBe(editor)
			expect(editor).toHaveFocus()
		})

		it('если изменение ничего не сделало, ввод не сообщается', () => {
			const { editor, ctx } = createContext('<p>a</p>')
			caretAt(editor.querySelector('p')!.firstChild!, 0)

			expect(applyEdit(ctx as unknown as EditorEditContext, () => false)).toBe(false)

			expect(ctx.onInput).not.toHaveBeenCalled()
			expect(ctx.saveSelection).not.toHaveBeenCalled()
		})

		it('успешное изменение фиксируется один раз', () => {
			const { editor, ctx } = createContext('<p>a</p>')
			caretAt(editor.querySelector('p')!.firstChild!, 0)

			expect(applyEdit(ctx as unknown as EditorEditContext, () => true)).toBe(true)

			expect(ctx.saveSelection).toHaveBeenCalledTimes(1)
			expect(ctx.onInput).toHaveBeenCalledTimes(1)
		})
	})

	describe('команды', () => {
		it('insertHtmlCommand вставляет HTML в каретку, а без выделения — в конец текста', () => {
			const { editor, ctx } = createContext('<p>ab</p>')
			caretAt(editor.querySelector('p')!.firstChild!, 1)
			insertHtmlCommand(ctx as unknown as UseToolbarCommandsOptions, '<b>x</b>')
			expect(editor.innerHTML).toBe('<p>a<b>x</b>b</p>')

			window.getSelection()?.removeAllRanges()
			insertHtmlCommand(ctx as unknown as UseToolbarCommandsOptions, '<i>y</i>')
			expect(editor.innerHTML).toBe('<p>a<b>x</b>b</p><p><i>y</i></p>')
			expect(ctx.onInput).toHaveBeenCalledTimes(2)
		})

		it('insertLineBreakCommand вставляет br в каретку', () => {
			const { editor, ctx } = createContext('<p>ab</p>')
			caretAt(editor.querySelector('p')!.firstChild!, 1)

			insertLineBreakCommand(ctx as unknown as UseToolbarCommandsOptions)

			expect(editor.innerHTML).toBe('<p>a<br>b</p>')
			expect(ctx.onInput).toHaveBeenCalledTimes(1)
		})
	})

	it('useEditorToolbar отдаёт insertHtml: вставка в каретку и сообщение о вводе', () => {
		const { editor } = createContext('<p>ab</p>')
		const onInput = vi.fn()
		let toolbar!: ReturnType<typeof useEditorToolbar>
		mount({
			setup() {
				toolbar = useEditorToolbar({ editorRef: ref(editor), codeTextareaRef: ref(null), onInput })
				return () => null
			},
		})
		caretAt(editor.querySelector('p')!.firstChild!, 2)

		toolbar.insertHtml('<b>x</b>')

		expect(editor.innerHTML).toBe('<p>ab<b>x</b></p>')
		expect(onInput).toHaveBeenCalledTimes(1)
	})

	it('история тулбара: вставка отменяется и повторяется, onRestore сообщает о восстановлении', () => {
		const { editor } = createContext('<p>ab</p>')
		const onRestore = vi.fn()
		const state = { isReadonly: false }
		let toolbar!: ReturnType<typeof useEditorToolbar>
		mount({
			setup() {
				toolbar = useEditorToolbar({
					editorRef: ref(editor),
					codeTextareaRef: ref(null),
					onInput: kind => toolbar.history.record(kind ?? 'command'),
					onRestore,
					isReadonly: () => state.isReadonly,
				})
				return () => null
			},
		})
		toolbar.history.reset()
		caretAt(editor.querySelector('p')!.firstChild!, 2)
		toolbar.insertHtml('<b>x</b>')

		expect(toolbar.history.canUndo.value).toBe(true)
		toolbar.history.undo()
		expect(editor.innerHTML).toBe('<p>ab</p>')
		expect(onRestore).toHaveBeenCalledTimes(1)
		toolbar.history.redo()
		expect(editor.innerHTML).toBe('<p>ab<b>x</b></p>')

		state.isReadonly = true
		expect(toolbar.history.undo()).toBe(false)
		state.isReadonly = false
		toolbar.toggleCodeMode()
		expect(toolbar.history.undo()).toBe(false)
	})

	it('useEditorToolbar без onRestore: отмена не падает', () => {
		const { editor } = createContext('<p>ab</p>')
		let toolbar!: ReturnType<typeof useEditorToolbar>
		mount({
			setup() {
				toolbar = useEditorToolbar({
					editorRef: ref(editor),
					codeTextareaRef: ref(null),
					onInput: kind => toolbar.history.record(kind ?? 'command'),
				})
				return () => null
			},
		})
		toolbar.history.reset()
		caretAt(editor.querySelector('p')!.firstChild!, 2)
		toolbar.insertHtml('<b>x</b>')

		expect(toolbar.history.undo()).toBe(true)
	})

	it('режим кода: без правок возвращается исходный HTML без очистки, с правкой — результат sanitize или код как есть', async () => {
		const { editor } = createContext('<p onclick="x()">ab</p>')
		const sanitize = vi.fn((html: string) => html.replace(' onclick="x()"', ''))
		let toolbar!: ReturnType<typeof useEditorToolbar>
		mount({
			setup() {
				toolbar = useEditorToolbar({ editorRef: ref(editor), codeTextareaRef: ref(null), onInput: vi.fn(), sanitize })
				return () => null
			},
		})

		toolbar.toggleCodeMode()
		toolbar.toggleCodeMode()
		await nextTick()
		expect(editor.innerHTML).toBe('<p onclick="x()">ab</p>')
		expect(sanitize).not.toHaveBeenCalled()

		toolbar.toggleCodeMode()
		toolbar.codeContent.value = '<p onclick="x()">changed</p>'
		toolbar.toggleCodeMode()
		await nextTick()
		expect(editor.innerHTML).toBe('<p>changed</p>')

		let plain!: ReturnType<typeof useEditorToolbar>
		mount({
			setup() {
				plain = useEditorToolbar({ editorRef: ref(editor), codeTextareaRef: ref(null), onInput: vi.fn() })
				return () => null
			},
		})
		plain.toggleCodeMode()
		plain.codeContent.value = '<p>raw</p>'
		plain.toggleCodeMode()
		await nextTick()
		expect(editor.innerHTML).toBe('<p>raw</p>')
	})

	describe('заполнители и вырезание', () => {
		const PENDING = '<p>text<b data-rise-pending="">​</b></p>'

		it('applyEdit снимает чужой заполнитель в составе правки: после запоминания выделения и до изменения DOM', () => {
			const { editor, ctx } = createContext(PENDING)
			const order: string[] = []
			const withHooks = { ...ctx, onBeforeChange: () => order.push(`before:${editor.innerHTML.includes('pending')}`) }
			caretAt(editor.querySelector('p')!.firstChild!, 1)

			const result = applyEdit(withHooks as unknown as EditorEditContext, () => {
				order.push(`change:${editor.innerHTML.includes('pending')}`)
				return true
			})

			expect(result).toBe(true)
			expect(order).toEqual(['before:true', 'change:false'])
		})

		it('applyEdit не снимает заполнитель, в котором стоит каретка', () => {
			const { editor, ctx } = createContext(PENDING)
			caretAt(editor.querySelector('b')!.firstChild!, 1)

			applyEdit(ctx as unknown as EditorEditContext, () => true)

			expect(editor.innerHTML).toBe(PENDING)
		})

		it('если правка ничего не изменила, но заполнитель снят, изменение всё равно фиксируется', () => {
			const { editor, ctx } = createContext(PENDING)
			caretAt(editor.querySelector('p')!.firstChild!, 1)

			const result = applyEdit(ctx as unknown as EditorEditContext, () => false)

			expect(result).toBe(false)
			expect(ctx.onInput).toHaveBeenCalledTimes(1)
			expect(editor.innerHTML).toBe('<p>text</p>')
		})

		it('deleteSelectionCommand удаляет выделение и сообщает о вводе', () => {
			const { editor, ctx } = createContext('<p>hello</p><p>world</p>')
			window.getSelection()?.setBaseAndExtent(editor.firstElementChild!.firstChild!, 3, editor.lastElementChild!.firstChild!, 2)

			expect(deleteSelectionCommand(ctx as unknown as UseToolbarCommandsOptions)).toBe(true)

			expect(editor.innerHTML).toBe('<p>helrld</p>')
			expect(ctx.onInput).toHaveBeenCalledWith('command')
		})

		it('deleteSelectionCommand без выделения ничего не делает', () => {
			const { editor, ctx } = createContext('<p>hello</p>')
			caretAt(editor.querySelector('p')!.firstChild!, 2)

			expect(deleteSelectionCommand(ctx as unknown as UseToolbarCommandsOptions)).toBe(false)
			expect(ctx.onInput).not.toHaveBeenCalled()
		})
	})
})
