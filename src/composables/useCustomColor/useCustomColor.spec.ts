/**
 * Unit-тесты для composable useCustomColor.
 * Проверяют вычисление CSS-переменных кастомного цвета (bg/text).
 */

import '@testing-library/jest-dom/vitest'
import { ref } from 'vue'

import { useCustomColor } from './useCustomColor'
import type { CustomColor } from './useCustomColor.types'

describe('useCustomColor', () => {
	describe('customColorStyle без цвета', () => {
		it('должен возвращать undefined когда цвет не задан', () => {
			const { customColorStyle } = useCustomColor({ getColor: () => undefined })

			expect(customColorStyle.value).toBeUndefined()
		})

		it('должен возвращать undefined когда объект пустой', () => {
			const { customColorStyle } = useCustomColor({ getColor: () => ({}) })

			expect(customColorStyle.value).toBeUndefined()
		})
	})

	describe('customColorStyle с bg', () => {
		it('должен устанавливать --custom-bg при base', () => {
			const color: CustomColor = { bg: { base: '#ff0000' } }
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toEqual({
				'--custom-bg': '#ff0000',
			})
		})

		it('должен устанавливать все --custom-bg* переменные', () => {
			const color: CustomColor = {
				bg: {
					base: '#ff0000',
					hover: '#cc0000',
					active: '#990000',
					focus: 'rgba(255, 0, 0, 0.5)',
				},
			}
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toEqual({
				'--custom-bg': '#ff0000',
				'--custom-bg-hover': '#cc0000',
				'--custom-bg-active': '#990000',
				'--custom-bg-focus': 'rgba(255, 0, 0, 0.5)',
			})
		})

		it('должен устанавливать только hover/active/focus когда нет base', () => {
			const color: CustomColor = {
				bg: { hover: '#cc0000', active: '#990000', focus: 'rgba(255,0,0,0.5)' },
			}
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toEqual({
				'--custom-bg-hover': '#cc0000',
				'--custom-bg-active': '#990000',
				'--custom-bg-focus': 'rgba(255,0,0,0.5)',
			})
		})
	})

	describe('customColorStyle с text', () => {
		it('должен устанавливать --custom-text при base', () => {
			const color: CustomColor = { text: { base: '#ffffff' } }
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toEqual({
				'--custom-text': '#ffffff',
			})
		})

		it('должен устанавливать все --custom-text* переменные', () => {
			const color: CustomColor = {
				text: {
					base: '#ffffff',
					hover: '#f0f0f0',
					active: '#e0e0e0',
					focus: '#d0d0d0',
				},
			}
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toEqual({
				'--custom-text': '#ffffff',
				'--custom-text-hover': '#f0f0f0',
				'--custom-text-active': '#e0e0e0',
				'--custom-text-focus': '#d0d0d0',
			})
		})

		it('должен устанавливать только hover/active/focus когда нет base', () => {
			const color: CustomColor = {
				text: { hover: '#f0f0f0', active: '#e0e0e0', focus: '#d0d0d0' },
			}
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toEqual({
				'--custom-text-hover': '#f0f0f0',
				'--custom-text-active': '#e0e0e0',
				'--custom-text-focus': '#d0d0d0',
			})
		})
	})

	describe('customColorStyle с bg и text', () => {
		it('должен устанавливать переменные обоих типов', () => {
			const color: CustomColor = {
				bg: { base: '#8b5cf6', hover: '#7c3aed' },
				text: { base: '#ffffff' },
			}
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toEqual({
				'--custom-bg': '#8b5cf6',
				'--custom-bg-hover': '#7c3aed',
				'--custom-text': '#ffffff',
			})
		})
	})

	describe('реактивность', () => {
		it('должен обновляться при изменении цвета', () => {
			const color = ref<CustomColor | undefined>(undefined)
			const { customColorStyle } = useCustomColor({ getColor: () => color.value })

			expect(customColorStyle.value).toBeUndefined()

			color.value = { bg: { base: '#ff0000' } }
			expect(customColorStyle.value).toEqual({ '--custom-bg': '#ff0000' })

			color.value = { bg: { base: '#00ff00' }, text: { base: '#000' } }
			expect(customColorStyle.value).toEqual({
				'--custom-bg': '#00ff00',
				'--custom-text': '#000',
			})

			color.value = undefined
			expect(customColorStyle.value).toBeUndefined()
		})
	})

	describe('CSS-переменная как значение', () => {
		it('должен поддерживать var() в качестве значения', () => {
			const color: CustomColor = { bg: { base: 'var(--color-accent)' } }
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toEqual({
				'--custom-bg': 'var(--color-accent)',
			})
		})
	})

	describe('пустые вложенные объекты', () => {
		it('должен возвращать undefined когда bg пустой', () => {
			const color: CustomColor = { bg: {} }
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toBeUndefined()
		})

		it('должен возвращать undefined когда text пустой', () => {
			const color: CustomColor = { text: {} }
			const { customColorStyle } = useCustomColor({ getColor: () => color })

			expect(customColorStyle.value).toBeUndefined()
		})
	})
})
