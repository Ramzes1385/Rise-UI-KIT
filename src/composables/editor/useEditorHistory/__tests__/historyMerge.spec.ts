import { ref } from 'vue'
import { useEditorHistory } from '../useEditorHistory'
import type { EditorHistoryKind } from '../types/useEditorHistory.types'

function setup(html = '<p>a</p>') {
	const root = document.createElement('div')
	root.innerHTML = html
	document.body.appendChild(root)
	const history = useEditorHistory({ root: ref<HTMLElement | null>(root), isEnabled: () => true, onRestore: vi.fn() })
	history.reset()
	return { root, history }
}

function textOf(root: HTMLElement): Text {
	return root.querySelector('p')!.firstChild as Text
}

function caretAt(root: HTMLElement, offset: number): void {
	window.getSelection()?.setBaseAndExtent(textOf(root), offset, textOf(root), offset)
}

function edit(ctx: ReturnType<typeof setup>, at: { kind: EditorHistoryKind; offset: number }, change: (text: Text) => void): void {
	ctx.history.capture()
	change(textOf(ctx.root))
	caretAt(ctx.root, at.offset)
	ctx.history.record(at.kind)
}

function append(ctx: ReturnType<typeof setup>, kind: EditorHistoryKind, value: string): void {
	edit(ctx, { kind, offset: textOf(ctx.root).data.length + value.length }, text => {
		text.data += value
	})
}

function countSteps(ctx: ReturnType<typeof setup>): number {
	let steps = 0
	while (ctx.history.undo()) steps++
	return steps
}

describe('useEditorHistory: склейка и сброс', () => {
	beforeEach(() => {
		vi.useFakeTimers()
		vi.setSystemTime(new Date('2025-05-15T10:00:00Z'))
	})

	afterEach(() => {
		vi.useRealTimers()
		window.getSelection()?.removeAllRanges()
		document.body.innerHTML = ''
	})

	describe('перетаскивание', () => {
		it('части одного перетаскивания склеиваются, даже если выделение в них разное', () => {
			const ctx = setup('<p>abcdef</p>')
			caretAt(ctx.root, 6)
			edit(ctx, { kind: 'drag', offset: 0 }, text => {
				text.data = text.data.slice(1)
			})
			vi.advanceTimersByTime(10)
			edit(ctx, { kind: 'drag', offset: 4 }, text => {
				text.data = `${text.data.slice(0, 4)}X${text.data.slice(4)}`
			})

			expect(countSteps(ctx)).toBe(1)
			expect(ctx.root.innerHTML).toBe('<p>abcdef</p>')
		})

		it('число правок перетаскивания не ограничено размером группы набора', () => {
			const ctx = setup()
			caretAt(ctx.root, 1)
			for (let index = 0; index < 25; index++) append(ctx, 'drag', 'x')

			expect(countSteps(ctx)).toBe(1)
		})

		it('перетаскивание после паузы начинает новый шаг', () => {
			const ctx = setup()
			caretAt(ctx.root, 1)
			append(ctx, 'drag', 'b')
			vi.advanceTimersByTime(500)
			append(ctx, 'drag', 'c')

			expect(countSteps(ctx)).toBe(2)
		})

		it('набор сразу после перетаскивания - отдельный шаг', () => {
			const ctx = setup()
			caretAt(ctx.root, 1)
			append(ctx, 'drag', 'b')
			append(ctx, 'typing', 'c')

			expect(countSteps(ctx)).toBe(2)
		})
	})

	describe('набор', () => {
		it('пауза считается от последней правки, а не от начала шага', () => {
			const ctx = setup()
			caretAt(ctx.root, 1)
			append(ctx, 'typing', 'b')
			vi.advanceTimersByTime(400)
			append(ctx, 'typing', 'c')
			vi.advanceTimersByTime(400)
			append(ctx, 'typing', 'd')

			expect(countSteps(ctx)).toBe(1)
			expect(ctx.root.innerHTML).toBe('<p>a</p>')
		})

		it('набор с прыжком каретки внутри паузы - новый шаг', () => {
			const ctx = setup('<p>abc</p>')
			caretAt(ctx.root, 3)
			append(ctx, 'typing', 'd')
			caretAt(ctx.root, 0)
			edit(ctx, { kind: 'typing', offset: 1 }, text => {
				text.data = `Z${text.data}`
			})

			expect(countSteps(ctx)).toBe(2)
		})
	})

	describe('после отмены', () => {
		it('набор после отмены не вливается в отменённый шаг', () => {
			const ctx = setup()
			caretAt(ctx.root, 1)
			append(ctx, 'typing', 'b')
			ctx.history.undo()
			expect(ctx.history.canRedo.value).toBe(true)

			append(ctx, 'typing', 'c')

			expect(ctx.history.canRedo.value).toBe(false)
			expect(ctx.history.canUndo.value).toBe(true)
			ctx.history.undo()
			expect(ctx.root.innerHTML).toBe('<p>a</p>')
			ctx.history.redo()
			expect(ctx.root.innerHTML).toBe('<p>ac</p>')
		})

		it('набор после повтора не вливается в повторённый шаг', () => {
			const ctx = setup()
			caretAt(ctx.root, 1)
			append(ctx, 'typing', 'b')
			ctx.history.undo()
			ctx.history.redo()

			append(ctx, 'typing', 'c')

			expect(countSteps(ctx)).toBe(2)
		})
	})

	describe('reset', () => {
		it('очищает повтор', () => {
			const ctx = setup()
			caretAt(ctx.root, 1)
			append(ctx, 'command', 'b')
			ctx.history.undo()
			expect(ctx.history.canRedo.value).toBe(true)

			ctx.history.reset()

			expect(ctx.history.canRedo.value).toBe(false)
			expect(ctx.history.redo()).toBe(false)
		})

		it('сбрасывает захваченное выделение: следующий шаг берёт выделение с момента сброса', () => {
			const ctx = setup('<p>abc</p>')
			caretAt(ctx.root, 0)
			ctx.history.capture()
			caretAt(ctx.root, 2)
			ctx.history.reset()

			textOf(ctx.root).data = 'abcd'
			caretAt(ctx.root, 4)
			ctx.history.record('command')
			ctx.history.undo()

			expect(window.getSelection()!.anchorOffset).toBe(2)
		})

		it('закрывает открытый шаг: набор после сброса начинает новую историю', () => {
			const ctx = setup()
			caretAt(ctx.root, 1)
			append(ctx, 'typing', 'b')
			ctx.history.reset()

			append(ctx, 'typing', 'c')

			expect(countSteps(ctx)).toBe(1)
			expect(ctx.root.innerHTML).toBe('<p>ab</p>')
		})
	})

	it('откат системных часов не вливает правку в старый шаг', () => {
		const ctx = setup()
		caretAt(ctx.root, 1)
		append(ctx, 'typing', 'b')
		vi.setSystemTime(new Date('2025-05-15T09:00:00Z'))
		append(ctx, 'typing', 'c')

		expect(countSteps(ctx)).toBe(2)
	})
})
