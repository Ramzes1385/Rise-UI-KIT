/**
 * Unit-тесты для composable useVariant.
 * Проверяют вычисление БЭМ-модификатора и CSS-переменной --variant.
 */

import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'

import { useVariant } from './useVariant'

describe('useVariant', () => {
	describe('variantClass', () => {
		it('должен возвращать правильный класс для варианта', () => {
			const { variantClass } = useVariant({
				block: 'test-block',
				getVariant: () => 'outline',
			})

			expect(variantClass.value).toBe('test-block--outline')
		})

		it('должен возвращать undefined если вариант не передан', () => {
			const { variantClass } = useVariant({
				block: 'test-block',
				getVariant: () => undefined,
			})

			expect(variantClass.value).toBeUndefined()
		})

		it('должен возвращать undefined для варианта default', () => {
			const { variantClass } = useVariant({
				block: 'test-block',
				getVariant: () => 'default',
			})

			expect(variantClass.value).toBeUndefined()
		})

		it('должен возвращать undefined для пустой строки', () => {
			const { variantClass } = useVariant({
				block: 'test-block',
				getVariant: () => '',
			})

			expect(variantClass.value).toBeUndefined()
		})
	})

	describe('variantStyle', () => {
		it('должен возвращать CSS-переменную для варианта', () => {
			const { variantStyle } = useVariant({
				block: 'test-block',
				getVariant: () => 'outline',
			})

			expect(variantStyle.value).toEqual({ '--variant': 'outline' })
		})

		it('должен возвращать undefined если вариант не передан', () => {
			const { variantStyle } = useVariant({
				block: 'test-block',
				getVariant: () => undefined,
			})

			expect(variantStyle.value).toBeUndefined()
		})

		it('должен возвращать undefined для варианта default', () => {
			const { variantStyle } = useVariant({
				block: 'test-block',
				getVariant: () => 'default',
			})

			expect(variantStyle.value).toBeUndefined()
		})

		it('должен возвращать undefined для пустой строки', () => {
			const { variantStyle } = useVariant({
				block: 'test-block',
				getVariant: () => '',
			})

			expect(variantStyle.value).toBeUndefined()
		})
	})

	describe('реактивность', () => {
		it('должен обновляться при изменении варианта', () => {
			const variant = ref<string | undefined>('outline')
			const { variantClass, variantStyle } = useVariant({
				block: 'test-block',
				getVariant: () => variant.value,
			})

			expect(variantClass.value).toBe('test-block--outline')
			expect(variantStyle.value).toEqual({ '--variant': 'outline' })

			variant.value = 'ghost'
			expect(variantClass.value).toBe('test-block--ghost')
			expect(variantStyle.value).toEqual({ '--variant': 'ghost' })

			variant.value = 'default'
			expect(variantClass.value).toBeUndefined()
			expect(variantStyle.value).toBeUndefined()

			variant.value = undefined
			expect(variantClass.value).toBeUndefined()
			expect(variantStyle.value).toBeUndefined()
		})
	})
})
