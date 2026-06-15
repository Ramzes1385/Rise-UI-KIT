import { hasElementKeys, isObject } from './typeUtils'

describe('isObject', () => {
	it('возвращает true для простого объекта', () => {
		expect(isObject({ a: 1 })).toBe(true)
	})

	it('возвращает false для null', () => {
		expect(isObject(null)).toBe(false)
	})

	it('возвращает false для массива', () => {
		expect(isObject([1, 2])).toBe(false)
	})

	it('возвращает false для примитива', () => {
		expect(isObject('hello')).toBe(false)
		expect(isObject(42)).toBe(false)
		expect(isObject(undefined)).toBe(false)
	})
})

describe('hasElementKeys', () => {
	it('возвращает true если хотя бы один ключ найден', () => {
		expect(hasElementKeys({ root: 'a', other: 'b' }, ['root'])).toBe(true)
	})

	it('возвращает false если ни один ключ не найден', () => {
		expect(hasElementKeys({ other: 'b' }, ['root', 'input'])).toBe(false)
	})

	it('возвращает false для пустого массива ключей', () => {
		expect(hasElementKeys({ root: 'a' }, [])).toBe(false)
	})
})
