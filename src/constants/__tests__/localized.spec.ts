/**
 * Константы со строками интерфейса читают словарь текущего языка и следуют его смене.
 */

import { computed } from 'vue'
import { setLocale } from '@/locales/state'
import { UI_ARIA, UI_EDITOR, UI_TEXT } from '../index'
import { localized } from '../localized'

afterEach(() => {
	setLocale('ru')
})

describe('localized', () => {
	it('возвращает строку текущего языка', () => {
		expect(UI_ARIA.CLOSE).toBe('Закрыть')

		setLocale('en')
		expect(UI_ARIA.CLOSE).toBe('Close')
	})

	it('computed и шаблоны перевычисляются при смене языка', () => {
		const label = computed(() => `${UI_TEXT.CANCEL} / ${UI_TEXT.CONFIRM}`)
		expect(label.value).toBe('Отмена / Подтвердить')

		setLocale('en')
		expect(label.value).toBe('Cancel / Confirm')
	})

	it('ключи, in, копия через spread и дополнительные поля', () => {
		expect('CLOSE' in UI_ARIA).toBe(true)
		expect('MISSING' in UI_ARIA).toBe(false)
		expect(Object.keys(UI_TEXT)).toContain('EMPTY')
		expect({ ...UI_TEXT }.EMPTY).toBe('Нет данных')

		expect(UI_EDITOR.DEFAULT_TEXT_COLOR).toBe('#000000')
		expect('DEFAULT_BG_COLOR' in UI_EDITOR).toBe(true)
		expect(Object.keys(UI_EDITOR)).toEqual(expect.arrayContaining(['BOLD', 'DEFAULT_TEXT_COLOR']))
		expect(Object.getOwnPropertyDescriptor(UI_EDITOR, 'DEFAULT_BG_COLOR')?.value).toBe('#ffff00')
	})

	it('неизвестный ключ — undefined', () => {
		const section = localized('tour')

		expect((section as Record<string, unknown>).MISSING).toBeUndefined()
		expect(Object.getOwnPropertyDescriptor(section, 'MISSING')).toBeUndefined()
	})
})
