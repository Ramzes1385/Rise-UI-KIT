import { computed } from 'vue'
import { setLocale } from '../state'
import { localized } from '../localized'
import { UI_ARIA, UI_TEXT } from '../messages'

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

	it('ключи, in и копия через spread', () => {
		expect('CLOSE' in UI_ARIA).toBe(true)
		expect('MISSING' in UI_ARIA).toBe(false)
		expect(Object.keys(UI_TEXT)).toContain('EMPTY')
		expect({ ...UI_TEXT }.EMPTY).toBe('Нет данных')
	})

	it('неизвестный ключ — undefined', () => {
		const section = localized('tour')

		expect((section as Record<string, unknown>).MISSING).toBeUndefined()
		expect(Object.getOwnPropertyDescriptor(section, 'MISSING')).toBeUndefined()
	})
})
