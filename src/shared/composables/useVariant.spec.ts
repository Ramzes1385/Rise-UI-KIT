import { describe, expect, it } from 'vitest'
import { useVariant } from './useVariant'

describe('useVariant', () => {
	it('должен возвращать правильный класс для варианта', () => {
		const { variantClass } = useVariant({
			block: 'test-block',
			getVariant: () => 'outline',
		})
		expect(variantClass.value).toBe('test-block--outline')
	})

	it('должен возвращать пустую строку если вариант не передан', () => {
		const { variantClass } = useVariant({
			block: 'test-block',
			getVariant: () => undefined,
		})
		expect(variantClass.value).toBe('')
	})
})
