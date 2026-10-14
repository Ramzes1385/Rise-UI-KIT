import { getHistoryAction, getHistoryKind } from '../helpers/historyInput'

function key(init: KeyboardEventInit): KeyboardEvent {
	return new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
}

describe('getHistoryAction', () => {
	it.each([
		['Ctrl+Z', { key: 'z', code: 'KeyZ', ctrlKey: true }, false, 'undo'],
		['⌘+Z', { key: 'z', code: 'KeyZ', metaKey: true }, true, 'undo'],
		['Ctrl+Shift+Z', { key: 'Z', code: 'KeyZ', ctrlKey: true, shiftKey: true }, false, 'redo'],
		['⌘+Shift+Z', { key: 'Z', code: 'KeyZ', metaKey: true, shiftKey: true }, true, 'redo'],
		['Ctrl+Y не на Mac', { key: 'y', code: 'KeyY', ctrlKey: true }, false, 'redo'],
		['русская раскладка: я на KeyZ', { key: 'я', code: 'KeyZ', ctrlKey: true }, false, 'undo'],
		['русская раскладка: н на KeyY', { key: 'н', code: 'KeyY', ctrlKey: true }, false, 'redo'],
		['QWERTZ: z на KeyY — отмена, не повтор', { key: 'z', code: 'KeyY', ctrlKey: true }, false, 'undo'],
	] as const)('%s', (...row) => {
		const [, init, isMac, expected] = row
		expect(getHistoryAction(key(init), isMac)).toBe(expected)
	})

	it.each([
		['⌘+Y на Mac', { key: 'y', code: 'KeyY', metaKey: true }, true],
		['Ctrl+Y на Mac', { key: 'y', code: 'KeyY', ctrlKey: true }, true],
		['⌘+Y не на Mac (Win+Y)', { key: 'y', code: 'KeyY', metaKey: true }, false],
		['Ctrl+Shift+Y', { key: 'Y', code: 'KeyY', ctrlKey: true, shiftKey: true }, false],
		['Ctrl+Alt+Z (AltGr)', { key: 'z', code: 'KeyZ', ctrlKey: true, altKey: true }, false],
		['Z без модификатора', { key: 'z', code: 'KeyZ' }, false],
		['Ctrl+B', { key: 'b', code: 'KeyB', ctrlKey: true }, false],
		['во время композиции', { key: 'z', code: 'KeyZ', ctrlKey: true, isComposing: true }, false],
		['keyCode 229', { key: 'Process', code: 'KeyZ', ctrlKey: true, keyCode: 229 }, false],
	] as const)('не наше: %s', (_name, init, isMac) => {
		expect(getHistoryAction(key(init), isMac)).toBeNull()
	})
})

describe('getHistoryKind', () => {
	it.each([
		['insertText', 'typing'],
		['insertCompositionText', 'typing'],
		['insertParagraph', 'typing'],
		['insertLineBreak', 'typing'],
		['deleteContentBackward', 'deleting'],
		['deleteContentForward', 'deleting'],
		['deleteWordBackward', 'deleting'],
		['deleteByDrag', 'drag'],
		['insertFromDrop', 'drag'],
		['deleteByCut', 'command'],
		['insertFromPaste', 'command'],
		['insertReplacementText', 'command'],
		['formatBold', 'command'],
		['historyUndo', 'command'],
		['', 'command'],
		[undefined, 'command'],
	] as const)('%s → %s', (inputType, expected) => {
		expect(getHistoryKind(inputType)).toBe(expected)
	})
})
