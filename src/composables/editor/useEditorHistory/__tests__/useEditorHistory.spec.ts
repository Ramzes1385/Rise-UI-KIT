import { ref } from 'vue'
import { useEditorHistory } from '../useEditorHistory'
import type { EditorHistoryKind } from '../types/useEditorHistory.types'

function setup(html = '<p>a</p>') {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	const rootRef = ref<HTMLElement | null>(root)
	const state = { isEnabled: true }
	const onRestore = vi.fn()
	const history = useEditorHistory({ root: rootRef, isEnabled: () => state.isEnabled, onRestore })
	history.reset()
	return { root, rootRef, state, onRestore, history }
}

function caretAtEnd(root: HTMLElement): void {
	const text = root.querySelector('p')!.firstChild as Text
	window.getSelection()?.setBaseAndExtent(text, text.data.length, text, text.data.length)
}

function edit(ctx: ReturnType<typeof setup>, kind: EditorHistoryKind, change: (text: Text) => void): void {
	ctx.history.capture()
	const text = ctx.root.querySelector('p')!.firstChild as Text
	change(text)
	caretAtEnd(ctx.root)
	ctx.history.record(kind)
}

const append = (ctx: ReturnType<typeof setup>, kind: EditorHistoryKind, value: string): void =>
	edit(ctx, kind, text => {
		text.data += value
	})

const trim = (ctx: ReturnType<typeof setup>, kind: EditorHistoryKind): void =>
	edit(ctx, kind, text => {
		text.data = text.data.slice(0, -1)
	})

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
	return new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
}

function inputEvent(inputType: string): InputEvent {
	return new InputEvent('beforeinput', { bubbles: true, cancelable: true, inputType })
}

describe('useEditorHistory', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2025-05-15T10:00:00Z'))
	})

	afterEach(() => {
		vi.useRealTimers()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('склейка', () => {
		it('быстрый набор — один шаг', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'typing', 'b')
			vi.advanceTimersByTime(100)
			append(ctx, 'typing', 'c')

			expect(ctx.history.undo()).toBe(true)
			expect(ctx.root.innerHTML).toBe('<p>a</p>')
			expect(ctx.history.canUndo.value).toBe(false)
		})

		it('пауза 500 мс начинает новый шаг', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'typing', 'b')
			vi.advanceTimersByTime(500)
			append(ctx, 'typing', 'c')

			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>a</p>')
		})

		it('после 20 правок начинается новый шаг', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			for (let index = 0; index < 21; index++) append(ctx, 'typing', 'x')

			ctx.history.undo()
			expect(ctx.root.querySelector('p')!.textContent).toBe(`a${'x'.repeat(20)}`)
			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>a</p>')
		})

		it('прыжок каретки начинает новый шаг', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'typing', 'b')
			const text = ctx.root.querySelector('p')!.firstChild as Text
			window.getSelection()?.setBaseAndExtent(text, 0, text, 0)
			edit(ctx, 'typing', node => {
				node.data = `Z${node.data}`
			})

			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
		})

		it('набор и удаление не склеиваются между собой', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'typing', 'bc')
			trim(ctx, 'deleting')
			trim(ctx, 'deleting')

			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>abc</p>')
			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>a</p>')
		})

		it('команда не склеивается и закрывает открытый шаг', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'typing', 'b')
			append(ctx, 'command', 'C')
			append(ctx, 'command', 'D')
			append(ctx, 'typing', 'e')

			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>abCD</p>')
			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>abC</p>')
			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
		})

		it('две части одного перетаскивания — один шаг', () => {
			const ctx = setup('<p>abc</p>')
			caretAtEnd(ctx.root)
			trim(ctx, 'drag')
			vi.advanceTimersByTime(10)
			append(ctx, 'drag', 'X')

			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>abc</p>')
			expect(ctx.history.canUndo.value).toBe(false)
		})
	})

	describe('отмена и повтор', () => {
		it('отмена возвращает HTML и выделение до, повтор — HTML и выделение после', () => {
			const ctx = setup('<p>ab</p>')
			const text = ctx.root.querySelector('p')!.firstChild as Text
			window.getSelection()?.setBaseAndExtent(text, 2, text, 2)
			append(ctx, 'command', 'cd')

			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
			expect(window.getSelection()!.anchorOffset).toBe(2)
			expect(ctx.onRestore).toHaveBeenCalledTimes(1)

			ctx.history.redo()
			expect(ctx.root.innerHTML).toBe('<p>abcd</p>')
			expect(window.getSelection()!.anchorOffset).toBe(4)
			expect(ctx.onRestore).toHaveBeenCalledTimes(2)
		})

		it('правка после отмены очищает повтор', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'command', 'b')
			ctx.history.undo()
			expect(ctx.history.canRedo.value).toBe(true)

			append(ctx, 'command', 'c')

			expect(ctx.history.canRedo.value).toBe(false)
			expect(ctx.history.redo()).toBe(false)
		})

		it('101-й шаг вытесняет первый', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			for (let index = 0; index < 101; index++) append(ctx, 'command', 'x')

			let steps = 0
			while (ctx.history.undo()) steps++

			expect(steps).toBe(100)
			expect(ctx.root.querySelector('p')!.textContent).toBe('ax')
		})

		it('если путь выделения не найден, каретка уходит в конец', () => {
			const ctx = setup('<p>ab</p>')
			const text = ctx.root.querySelector('p')!.firstChild as Text
			window.getSelection()?.setBaseAndExtent(text, 1, text, 1)
			ctx.history.capture()
			ctx.root.innerHTML = '<p>ab</p><p>second</p>'
			ctx.history.record('command')
			ctx.root.querySelector('p')!.remove()
			ctx.root.querySelector('p')!.textContent = 'x'
			ctx.history.record('command')

			ctx.history.undo()
			ctx.history.undo()

			expect(window.getSelection()!.focusNode).not.toBeNull()
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
		})

		it('шаг без записанного выделения восстанавливает каретку в конец', () => {
			const ctx = setup('<p>ab</p>')
			window.getSelection()?.removeAllRanges()
			ctx.root.innerHTML = '<p>abc</p>'
			ctx.history.record('command')

			ctx.history.undo()

			expect(window.getSelection()!.anchorNode).toBe(ctx.root)
			expect(window.getSelection()!.anchorOffset).toBe(1)
		})

		it('правка мимо истории перед отменой становится отдельным шагом', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'command', 'b')
			ctx.root.innerHTML = '<p>ab!</p>'

			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>a</p>')
		})

		it('повтор после правки мимо истории: повторять нечего', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'command', 'b')
			ctx.history.undo()
			ctx.root.innerHTML = '<p>other</p>'

			expect(ctx.history.redo()).toBe(false)
		})

		it('без изменений HTML запись ничего не добавляет, захват сбрасывается', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			ctx.history.capture()
			ctx.history.record('command')

			expect(ctx.history.canUndo.value).toBe(false)
			expect(ctx.history.undo()).toBe(false)
		})

		it('запись без исходного состояния только запоминает его', () => {
			const ctx = setup()
			ctx.state.isEnabled = false
			ctx.history.reset()
			ctx.state.isEnabled = true
			ctx.rootRef.value = null
			ctx.history.reset()
			ctx.rootRef.value = ctx.root
			caretAtEnd(ctx.root)

			ctx.history.record('command')
			expect(ctx.history.canUndo.value).toBe(false)

			append(ctx, 'command', 'b')
			expect(ctx.history.canUndo.value).toBe(true)
		})

		it('документ с изображением на 1 МБ: патч шага меньше 1 КБ', () => {
			const big = `data:image/png;base64,${'A'.repeat(1_000_000)}`
			const ctx = setup(`<p>a</p><img src="${big}" alt="">`)
			caretAtEnd(ctx.root)
			const spy = vi.spyOn(JSON, 'stringify')

			append(ctx, 'command', 'b')
			ctx.history.undo()

			const patchSizes = spy.mock.calls.map(([value]) => JSON.stringify(value)?.length ?? 0)
			expect(Math.max(0, ...patchSizes.filter(size => size < 100_000))).toBeLessThan(1024)
			expect(ctx.root.querySelector('img')!.getAttribute('src')).toBe(big)
		})
	})

	describe('состояние и события', () => {
		it('canUndo и canRedo ложны, пока история выключена', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'command', 'b')
			expect(ctx.history.canUndo.value).toBe(true)

			ctx.state.isEnabled = false
			ctx.history.record('command')
			expect(ctx.history.undo()).toBe(false)
			expect(ctx.history.redo()).toBe(false)
			expect(ctx.history.handleKeyDown(keyEvent({ key: 'z', code: 'KeyZ', ctrlKey: true }))).toBe(false)
			expect(ctx.history.handleBeforeInput(inputEvent('historyUndo'), false)).toBe(false)
		})

		it('Ctrl+Z и Ctrl+Y гасятся, действуют и гасятся даже при пустом стеке', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'command', 'b')

			const undo = keyEvent({ key: 'z', code: 'KeyZ', ctrlKey: true })
			expect(ctx.history.handleKeyDown(undo)).toBe(true)
			expect(undo.defaultPrevented).toBe(true)
			expect(ctx.root.innerHTML).toBe('<p>a</p>')

			const redo = keyEvent({ key: 'y', code: 'KeyY', ctrlKey: true })
			expect(ctx.history.handleKeyDown(redo)).toBe(true)
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')

			const empty = keyEvent({ key: 'y', code: 'KeyY', ctrlKey: true })
			expect(ctx.history.handleKeyDown(empty)).toBe(true)
			expect(empty.defaultPrevented).toBe(true)
		})

		it('не наше сочетание не гасится', () => {
			const ctx = setup()
			const event = keyEvent({ key: 'b', code: 'KeyB', ctrlKey: true })

			expect(ctx.history.handleKeyDown(event)).toBe(false)
			expect(event.defaultPrevented).toBe(false)
		})

		it('beforeinput historyUndo и historyRedo гасятся и запускают свою отмену', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'command', 'b')

			const undo = inputEvent('historyUndo')
			expect(ctx.history.handleBeforeInput(undo, false)).toBe(true)
			expect(undo.defaultPrevented).toBe(true)
			expect(ctx.root.innerHTML).toBe('<p>a</p>')

			const redo = inputEvent('historyRedo')
			expect(ctx.history.handleBeforeInput(redo, false)).toBe(true)
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
		})

		it('во время композиции historyUndo гасится без действия', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'command', 'b')

			const event = inputEvent('historyUndo')
			expect(ctx.history.handleBeforeInput(event, true)).toBe(true)

			expect(event.defaultPrevented).toBe(true)
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
		})

		it('прочий beforeinput запоминает выделение, insertFromDrop и композиция — нет', () => {
			const ctx = setup('<p>abc</p>')
			const text = ctx.root.querySelector('p')!.firstChild as Text
			window.getSelection()?.setBaseAndExtent(text, 1, text, 1)

			expect(ctx.history.handleBeforeInput(inputEvent('insertText'), false)).toBe(false)
			text.data = 'aXbc'
			window.getSelection()?.setBaseAndExtent(text, 2, text, 2)
			expect(ctx.history.handleBeforeInput(inputEvent('insertFromDrop'), false)).toBe(false)
			expect(ctx.history.handleBeforeInput(inputEvent('insertCompositionText'), true)).toBe(false)
			ctx.history.record('typing')

			ctx.history.undo()
			expect(window.getSelection()!.anchorOffset).toBe(1)
		})

		it('reset очищает стеки и берёт текущее содержимое за исходное', () => {
			const ctx = setup()
			caretAtEnd(ctx.root)
			append(ctx, 'command', 'b')

			ctx.history.reset()

			expect(ctx.history.canUndo.value).toBe(false)
			expect(ctx.history.undo()).toBe(false)
			append(ctx, 'command', 'c')
			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
		})

		it('без области capture, запись и отмена ничего не делают', () => {
			const ctx = setup()
			ctx.rootRef.value = null

			ctx.history.capture()
			ctx.history.record('command')

			expect(ctx.history.undo()).toBe(false)
		})
	})
})
