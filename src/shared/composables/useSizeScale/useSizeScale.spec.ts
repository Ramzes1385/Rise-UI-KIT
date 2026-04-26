/**
 * Unit-тесты для composable useSizeScale.
 * Проверяют вычисление CSS-переменной --size-scale.
 */

import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'

import { useSizeScale } from './useSizeScale'

describe('useSizeScale', () => {
	describe('sizeScaleStyle при scale=100', () => {
		it('должен возвращать undefined когда scale=100', () => {
			const { sizeScaleStyle } = useSizeScale({ getScale: () => 100 })

			expect(sizeScaleStyle.value).toBeUndefined()
		})
	})

	describe('sizeScaleStyle при scale>100', () => {
		it('должен устанавливать --size-scale когда scale=150', () => {
			const { sizeScaleStyle } = useSizeScale({ getScale: () => 150 })

			expect(sizeScaleStyle.value).toEqual({ '--size-scale': '1.5' })
		})

		it('должен устанавливать --size-scale когда scale=200', () => {
			const { sizeScaleStyle } = useSizeScale({ getScale: () => 200 })

			expect(sizeScaleStyle.value).toEqual({ '--size-scale': '2' })
		})
	})

	describe('sizeScaleStyle при scale<100', () => {
		it('должен устанавливать --size-scale когда scale=75', () => {
			const { sizeScaleStyle } = useSizeScale({ getScale: () => 75 })

			expect(sizeScaleStyle.value).toEqual({ '--size-scale': '0.75' })
		})

		it('должен устанавливать --size-scale когда scale=50', () => {
			const { sizeScaleStyle } = useSizeScale({ getScale: () => 50 })

			expect(sizeScaleStyle.value).toEqual({ '--size-scale': '0.5' })
		})
	})

	describe('реактивность', () => {
		it('должен обновляться при изменении scale', () => {
			const scale = ref(100)
			const { sizeScaleStyle } = useSizeScale({ getScale: () => scale.value })

			expect(sizeScaleStyle.value).toBeUndefined()

			scale.value = 1.5
			expect(sizeScaleStyle.value).toEqual({ '--size-scale': '1.5' })

			scale.value = 1
			expect(sizeScaleStyle.value).toBeUndefined()
		})
	})
})
