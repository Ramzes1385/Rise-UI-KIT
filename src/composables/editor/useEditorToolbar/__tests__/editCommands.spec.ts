import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useEditorToolbar } from '../useEditorToolbar'
import type { EditorEditContext, UseToolbarCommandsOptions } from '../types/useToolbarCommands.types'
import { applyEdit, commitVisualChange, insertHtmlCommand, insertLineBreakCommand } from '../commands/editCommands'

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
		await Promise.resolve()

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
			expect(editor.innerHTML).toBe('<p>a<b>x</b>b</p><i>y</i>')
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
})
