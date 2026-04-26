/**
 * Unit-тесты для BaseTooltip.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen, waitFor } from '@testing-library/vue'

import BaseTooltip from './BaseTooltip.vue'

/** Опции рендера без заглушек Transition и Teleport */
const renderOptions = {
	global: {
		stubs: {
			Transition: false,
			Teleport: {
				inheritAttrs: true,
				template: '<div><slot /></div>',
			},
		},
	},
}

describe('BaseTooltip unit', () => {
	describe('рендер', () => {
		it('должен рендерить wrapper', () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<button>Кнопка</button>' },
				...renderOptions,
			})

			expect(container.querySelector('.base-tooltip-wrapper')).toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			expect(screen.getByText('Цель')).toBeInTheDocument()
		})
	})

	describe('пропс isAlwaysVisible', () => {
		it('должен рендерить тултип когда isAlwaysVisible=true', async () => {
			render(BaseTooltip, {
				props: { text: 'Подсказка', isAlwaysVisible: true },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			await waitFor(() => {
				expect(screen.getByText('Подсказка')).toBeInTheDocument()
			})
		})

		it('не должен рендерить тултип по умолчанию', () => {
			const { container } = render(BaseTooltip, {
				props: { text: 'Подсказка' },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			expect(container.querySelector('.base-tooltip')).not.toBeInTheDocument()
		})
	})

	describe('пропс position', () => {
		it('должен применять модификатор --top по умолчанию', async () => {
			render(BaseTooltip, {
				props: { text: 'Подсказка', isAlwaysVisible: true },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			await waitFor(() => {
				expect(screen.getByText('Подсказка').classList.contains('base-tooltip--top')).toBe(true)
			})
		})

		it('должен применять модификатор --bottom когда position=bottom', async () => {
			render(BaseTooltip, {
				props: { text: 'Подсказка', position: 'bottom', isAlwaysVisible: true },
				slots: { default: '<span>Цель</span>' },
				...renderOptions,
			})

			await waitFor(() => {
				expect(screen.getByText('Подсказка').classList.contains('base-tooltip--bottom')).toBe(true)
			})
		})
	})
})
