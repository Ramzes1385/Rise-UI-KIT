/**
 * Unit-тесты для BaseSearch.
 * Проверяют рендер и CSS-модификаторы.
 * Компонент использует BaseDropdown + BaseInput — стабаем для изоляции.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import BaseSearch from './BaseSearch.vue'

/** Стабаем дочерние компоненты для изоляции */
const globalConfig = {
	stubs: {
		BaseDropdown: {
			template: '<div class="base-dropdown-stub"><slot /><slot name="dropdown" /></div>',
		},
		BaseInput: {
			template: '<div class="base-input-stub"><slot name="prefix" /><slot name="suffix" /></div>',
			props: ['modelValue', 'placeholder', 'variant', 'size', 'isDisabled', 'type'],
		},
	},
}

describe('BaseSearch unit', () => {
	describe('рендер', () => {
		it('должен рендерить компонент поиска', () => {
			const { container } = render(BaseSearch, { global: globalConfig })

			expect(container.querySelector('.base-dropdown-stub')).toBeInTheDocument()
		})

		it('должен рендерить иконку поиска когда hasIcon=true', () => {
			const { container } = render(BaseSearch, {
				props: { hasIcon: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__icon')).toBeInTheDocument()
		})

		it('не должен рендерить иконку поиска когда hasIcon=false', () => {
			const { container } = render(BaseSearch, {
				props: { hasIcon: false },
				global: globalConfig,
			})

			expect(container.querySelector('.base-search__icon')).not.toBeInTheDocument()
		})
	})

	describe('пропс isLoading', () => {
		it('должен рендерить лоадер когда isLoading=true', () => {
			const { container } = render(BaseSearch, {
				props: { isLoading: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-loader')).toBeInTheDocument()
		})

		it('не должен рендерить лоадер когда isLoading=false', () => {
			const { container } = render(BaseSearch, {
				props: { isLoading: false },
				global: globalConfig,
			})

			expect(container.querySelector('.base-loader')).not.toBeInTheDocument()
		})
	})
})
