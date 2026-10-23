import { readStorage, writeStorage } from '../storageUtils'
import { afterEach, describe, expect, it, vi } from 'vitest'

describe('storageUtils', () => {
	afterEach(() => {
		vi.restoreAllMocks()
		localStorage.clear()
	})

	it('записывает и читает значение', () => {
		expect(writeStorage('key', 'value')).toBe(true)
		expect(readStorage('key')).toBe('value')
	})

	it('возвращает null для отсутствующего ключа', () => {
		expect(readStorage('missing')).toBeNull()
	})

	it('возвращает null, если доступ к хранилищу запрещён', () => {
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
			throw new DOMException('denied', 'SecurityError')
		})
		expect(readStorage('key')).toBeNull()
	})

	it('возвращает false, если запись невозможна', () => {
		vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
			throw new DOMException('quota', 'QuotaExceededError')
		})
		expect(writeStorage('key', 'value')).toBe(false)
	})
})
