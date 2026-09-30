import { effectScope, nextTick, ref } from 'vue'
import { isMacPlatform, matchesHotkey, parseHotkey, useHotkeys } from '../useHotkeys'

const press = (init: KeyboardEventInit, target: EventTarget = window) => {
	const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init })
	target.dispatchEvent(event)
	return event
}

describe('useHotkeys', () => {
	afterEach(() => vi.unstubAllGlobals())

	it('parseHotkey: mod — ⌘ на macOS и Ctrl на остальных, псевдонимы клавиш', () => {
		expect(parseHotkey('mod+shift+K', true)).toEqual({ key: 'k', ctrl: false, meta: true, shift: true, alt: false })
		expect(parseHotkey('mod+k', false)).toEqual({ key: 'k', ctrl: true, meta: false, shift: false, alt: false })
		expect(parseHotkey('cmd+option+esc', false)).toEqual({ key: 'escape', ctrl: false, meta: true, shift: false, alt: true })
		expect(parseHotkey('ctrl++', false).key).toBe('+')
	})

	it('matchesHotkey: буквы по клавише (русская раскладка), модификаторы строго, «?» без учёта Shift', () => {
		expect(matchesHotkey(new KeyboardEvent('keydown', { key: 'л', code: 'KeyK', ctrlKey: true }), 'mod+k', false)).toBe(true)
		expect(matchesHotkey(new KeyboardEvent('keydown', { key: 'k', code: 'KeyK', ctrlKey: true, shiftKey: true }), 'mod+k', false)).toBe(
			false,
		)
		expect(matchesHotkey(new KeyboardEvent('keydown', { key: '1', code: 'Digit1', altKey: true }), 'alt+1', false)).toBe(true)
		expect(matchesHotkey(new KeyboardEvent('keydown', { key: '?', shiftKey: true }), '?', false)).toBe(true)
		expect(matchesHotkey(new KeyboardEvent('keydown', { key: 'Escape', shiftKey: true }), 'escape', false)).toBe(false)
	})

	it('isMacPlatform по navigator', () => {
		vi.stubGlobal('navigator', { platform: 'MacIntel', userAgent: '' })
		expect(isMacPlatform()).toBe(true)
		vi.stubGlobal('navigator', { platform: '', userAgent: 'Windows NT' })
		expect(isMacPlatform()).toBe(false)
	})

	it('обработчик, preventDefault, поля ввода, isEnabled и снятие слушателя', async () => {
		const open = vi.fn()
		const help = vi.fn()
		const isEnabled = ref(true)
		const scope = effectScope()
		scope.run(() => useHotkeys({ 'mod+k': open, '?': help }, { isEnabled }))
		const input = document.createElement('input')
		document.body.append(input)

		expect(press({ key: 'k', code: 'KeyK', ctrlKey: true }).defaultPrevented).toBe(true)
		expect(open).toHaveBeenCalledTimes(1)
		press({ key: '?', shiftKey: true }, input)
		expect(help).not.toHaveBeenCalled()
		press({ key: 'k', code: 'KeyK', ctrlKey: true }, input)
		expect(open).toHaveBeenCalledTimes(2)
		press({ key: '?' })
		expect(help).toHaveBeenCalledTimes(1)
		expect(press({ key: 'z', code: 'KeyZ' }).defaultPrevented).toBe(false)
		isEnabled.value = false
		press({ key: '?' })
		press({ key: 'x', code: 'KeyX' })
		expect(help).toHaveBeenCalledTimes(1)
		isEnabled.value = true
		const handled = new KeyboardEvent('keydown', { key: '?', cancelable: true })
		handled.preventDefault()
		window.dispatchEvent(handled)
		press({ key: '?', isComposing: true })
		expect(help).toHaveBeenCalledTimes(1)
		scope.stop()
		press({ key: '?' })
		expect(help).toHaveBeenCalledTimes(1)
		input.remove()
		await nextTick()
	})

	it('свой target и isAllowedInFields', async () => {
		const run = vi.fn()
		const target = ref<HTMLElement | null>(null)
		const scope = effectScope()
		scope.run(() => useHotkeys({ '/': run }, { target, isAllowedInFields: true }))
		const input = document.createElement('input')
		document.body.append(input)

		press({ key: '/' }, input)
		expect(run).not.toHaveBeenCalled()
		target.value = input
		await nextTick()
		press({ key: '/' }, input)
		expect(run).toHaveBeenCalledTimes(1)
		scope.stop()
		input.remove()
	})

	it('без window (SSR) слушатель не ставится и ошибок нет', () => {
		const run = vi.fn()
		const scope = effectScope()
		vi.stubGlobal('window', undefined)

		expect(() => scope.run(() => useHotkeys({ 'mod+k': run }))).not.toThrow()
		vi.unstubAllGlobals()
		press({ key: 'k', code: 'KeyK', ctrlKey: true })
		expect(run).not.toHaveBeenCalled()
		scope.stop()
	})
})
