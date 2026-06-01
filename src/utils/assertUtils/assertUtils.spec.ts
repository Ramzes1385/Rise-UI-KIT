/**
 * Unit-тесты для assertUtils.
 * Покрывают: assertDefined — позитивные и негативные кейсы.
 */

import '@testing-library/jest-dom/vitest'

import { assertDefined } from './assertUtils'

describe('assertDefined', () => {
	it('не бросает для определённого значения', () => {
		expect(() => assertDefined({ id: 1 }, 'obj')).not.toThrow()
		expect(() => assertDefined('text')).not.toThrow()
	})

	it('не бросает для 0 и пустой строки (это валидные T)', () => {
		expect(() => assertDefined(0, 'zero')).not.toThrow()
		expect(() => assertDefined('', 'empty')).not.toThrow()
		expect(() => assertDefined(false, 'flag')).not.toThrow()
	})

	it('бросает TypeError для null с именем по умолчанию', () => {
		expect(() => assertDefined(null)).toThrow(TypeError)
		expect(() => assertDefined(null)).toThrow('assertDefined: value is null')
	})

	it('бросает TypeError для undefined с кастомным именем', () => {
		expect(() => assertDefined(undefined, 'inputRef')).toThrow(TypeError)
		expect(() => assertDefined(undefined, 'inputRef')).toThrow('assertDefined: inputRef is undefined')
	})
})
