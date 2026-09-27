/**
 * Unit-тесты BaseKbd: разметка kbd, служебные клавиши и платформа.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'
import BaseKbd from '../ui/BaseKbd.vue'

function kbdOf(value: string, platform?: 'mac' | 'other'): HTMLElement {
	const { container } = render(BaseKbd, { props: { value, platform } })
	return container.querySelector('kbd') as HTMLElement
}

describe('BaseKbd', () => {
	it('обычная клавиша — текст в kbd, слот заменяет value', () => {
		expect(kbdOf('K')).toHaveTextContent('K')
		const { container } = render(BaseKbd, { slots: { default: 'F5' } })
		expect(container.querySelector('kbd')).toHaveTextContent('F5')
	})

	it('служебные клавиши: символ скрыт от скринридера, название — скрытым текстом', () => {
		const shift = kbdOf('Shift')
		expect(shift.querySelector('[aria-hidden="true"]')).toHaveTextContent('⇧')
		expect(shift.querySelector('.base-kbd__name')).toHaveTextContent('Shift')
		const expected: Record<string, string> = {
			enter: '↵Enter',
			backspace: '⌫Backspace',
			delete: '⌦Delete',
			arrowup: '↑стрелка вверх',
			arrowdown: '↓стрелка вниз',
			arrowleft: '←стрелка влево',
			arrowright: '→стрелка вправо',
			escape: 'Esc',
			tab: 'Tab',
			space: 'Space',
		}
		for (const [value, text] of Object.entries(expected)) expect(kbdOf(value)).toHaveTextContent(text)
	})

	it('meta, ctrl и alt: на macOS — ⌘ ⌃ ⌥, на других системах — Ctrl и Alt', () => {
		expect(kbdOf('meta', 'mac')).toHaveTextContent('⌘Command')
		expect(kbdOf('ctrl', 'mac')).toHaveTextContent('⌃Control')
		expect(kbdOf('alt', 'mac')).toHaveTextContent('⌥Option')
		expect(kbdOf('meta', 'other')).toHaveTextContent('Ctrl')
		expect(kbdOf('control', 'other')).toHaveTextContent('Ctrl')
		expect(kbdOf('option', 'other')).toHaveTextContent('Alt')
	})

	it('платформа по браузеру: macOS по navigator.platform, без navigator — не macOS', () => {
		const platform = vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel')
		expect(kbdOf('meta')).toHaveTextContent('⌘')
		platform.mockReturnValue('')
		vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Windows NT 10.0)')
		expect(kbdOf('meta')).toHaveTextContent('Ctrl')
		vi.restoreAllMocks()

		vi.stubGlobal('navigator', undefined)
		expect(kbdOf('meta')).toHaveTextContent('Ctrl')
		vi.unstubAllGlobals()
	})
})
