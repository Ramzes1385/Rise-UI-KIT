/**
 * Unit-тесты для BaseEditor.
 * Проверяют рендер и CSS-модификаторы.
 * Компонент сложный — тестируем базовый рендер.
 */

import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/vue'

import BaseEditor from './BaseEditor.vue'

/** Стабаем дочерние компоненты для изоляции */
const globalConfig = {
	stubs: {
		BaseTooltip: {
			template: '<div class="tooltip-stub"><slot /></div>',
		},
	},
}

describe('BaseEditor unit', () => {
	describe('рендер', () => {
		it('должен рендерить редактор', () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			expect(container.querySelector('.base-editor')).toBeInTheDocument()
		})

		it('должен рендерить панель инструментов когда hasToolbar=true', () => {
			const { container } = render(BaseEditor, {
				props: { hasToolbar: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-editor__toolbar')).toBeInTheDocument()
		})

		it('не должен рендерить панель инструментов когда hasToolbar=false', () => {
			const { container } = render(BaseEditor, {
				props: { hasToolbar: false },
				global: globalConfig,
			})

			expect(container.querySelector('.base-editor__toolbar')).not.toBeInTheDocument()
		})
	})

	describe('пропс isReadonly', () => {
		it('должен применять модификатор --readonly когда isReadonly=true', () => {
			const { container } = render(BaseEditor, {
				props: { isReadonly: true },
				global: globalConfig,
			})

			expect(container.querySelector('.base-editor')?.classList.contains('base-editor--readonly')).toBe(true)
		})

		it('не должен применять модификатор --readonly по умолчанию', () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			expect(container.querySelector('.base-editor')?.classList.contains('base-editor--readonly')).toBe(false)
		})
	})

	describe('contenteditable область', () => {
		it('должен рендерить contenteditable область', () => {
			const { container } = render(BaseEditor, { global: globalConfig })

			expect(container.querySelector('[contenteditable]')).toBeInTheDocument()
		})
	})
})
