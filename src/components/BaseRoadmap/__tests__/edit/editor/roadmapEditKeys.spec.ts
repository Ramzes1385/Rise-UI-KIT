import { vi } from 'vitest'
import { mountEdit } from '../fixtures/editFixtures'
import { useRoadmapEditor } from '../../../model/edit/editor/useRoadmapEditor'
import { handleRoadmapEditKeydown } from '../../../model/edit/run/roadmapEditKeys'

function setup() {
	const mounted = mountEdit()
	const focusTitle = vi.fn()
	const editor = useRoadmapEditor(mounted.edit, focusTitle)
	function press(key: string, init: KeyboardEventInit = {}, target?: Element | null): KeyboardEvent {
		const event = new KeyboardEvent('keydown', { key, cancelable: true, ...init })
		if (target) Object.defineProperty(event, 'target', { value: target })
		handleRoadmapEditKeydown(event, {
			edit: mounted.edit,
			inspector: editor.inspector,
			state: editor,
			actions: editor,
			focusTitle,
		})
		return event
	}
	return { ...mounted, editor, focusTitle, press }
}

describe('горячие клавиши «Правки»', () => {
	it('Ctrl+Z отменяет, Ctrl+Shift+Z и Ctrl+Y повторяют, Cmd работает так же', async () => {
		const { edit, data, press } = setup()
		await edit.update('a', { title: 'Z' })
		expect(press('z', { ctrlKey: true }).defaultPrevented).toBe(true)
		expect(data.value.stages[0].topics[0].title).toBe('Тема a')
		press('Z', { ctrlKey: true, shiftKey: true })
		expect(data.value.stages[0].topics[0].title).toBe('Z')
		press('z', { metaKey: true })
		press('y', { ctrlKey: true })
		expect(data.value.stages[0].topics[0].title).toBe('Z')
	})

	it('V выбирает инструмент «Выбор», C — «Связь»; с модификатором клавиша не переключает', () => {
		const { editor, press } = setup()
		press('c')
		expect(editor.tool.value).toBe('link')
		press('V')
		expect(editor.tool.value).toBe('select')
		press('c', { ctrlKey: true })
		press('c', { altKey: true })
		press('c', { metaKey: true })
		expect(editor.tool.value).toBe('select')
	})

	it('F2 переводит фокус на название, Escape сбрасывает начало связи', () => {
		const { editor, focusTitle, press } = setup()
		const f2 = press('F2')
		expect(focusTitle).toHaveBeenCalledOnce()
		expect(f2.defaultPrevented).toBe(true)
		editor.linkFrom.value = 'a'
		press('Escape')
		expect(editor.linkFrom.value).toBeNull()
	})

	it('Delete и Ctrl+D работают над выбранным, без выбора и с чужой клавишей — молчат', async () => {
		const { editor, data, press } = setup()
		expect(press('Delete').defaultPrevented).toBe(false)
		expect(press('d', { ctrlKey: true }).defaultPrevented).toBe(false)
		editor.inspector.select('c')
		expect(press('q').defaultPrevented).toBe(false)
		expect(press('d', { ctrlKey: true }).defaultPrevented).toBe(true)
		await vi.waitFor(() => expect(data.value.stages[0].topics).toHaveLength(4))
		expect(press('Delete').defaultPrevented).toBe(true)
		await vi.waitFor(() => expect(data.value.stages[0].topics).toHaveLength(3))
	})

	it('при вводе текста, в списке выбора и при композиции клавиши игнорируются', () => {
		const { editor, press } = setup()
		const input = document.createElement('input')
		const area = document.createElement('textarea')
		const select = document.createElement('select')
		const editable = document.createElement('div')
		Object.defineProperty(editable, 'isContentEditable', { value: true })
		const list = document.createElement('ul')
		list.setAttribute('role', 'listbox')
		const item = document.createElement('li')
		list.append(item)
		for (const target of [input, area, select, editable, item]) {
			expect(press('c', {}, target).defaultPrevented).toBe(false)
			expect(editor.tool.value).toBe('select')
		}
		press('c', { isComposing: true })
		expect(editor.tool.value).toBe('select')
		const plain = document.createElement('div')
		press('c', {}, plain)
		expect(editor.tool.value).toBe('link')
		press('v', {}, null)
		expect(editor.tool.value).toBe('select')
	})
})
