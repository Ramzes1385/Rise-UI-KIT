/**
 * Unit-тест связи useVariant с константой DEFAULT_VARIANT.
 * Константа подменяется другим значением, чтобы отличить единый источник
 * от захардкоженного литерала 'default' (для остальных тестов значение совпадает).
 */

import { useVariant } from '../useVariant'

vi.mock('@constants', async () => ({
	...(await vi.importActual<Record<string, unknown>>('@constants')),
	DEFAULT_VARIANT: 'base',
}))

describe('useVariant и DEFAULT_VARIANT', () => {
	it('не должен добавлять модификатор и --variant для значения DEFAULT_VARIANT', () => {
		const { variantClass, variantStyle } = useVariant({
			block: 'test-block',
			getVariant: () => 'base',
		})

		expect(variantClass.value).toBeUndefined()
		expect(variantStyle.value).toBeUndefined()
	})

	it('должен добавлять модификатор для остальных вариантов', () => {
		const { variantClass } = useVariant({
			block: 'test-block',
			getVariant: () => 'ghost',
		})

		expect(variantClass.value).toBe('test-block--ghost')
	})
})
