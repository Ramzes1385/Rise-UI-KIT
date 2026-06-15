/**
 * Integration-тесты для BaseText.
 * Проверяют truncate, maxLines, weight, nowrap и их взаимодействие.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseText from '../ui/BaseText.vue'

describe('BaseText integration', () => {
	describe('truncate + maxLines', () => {
		it('должен добавлять класс --truncate когда truncate=true и maxLines=1', () => {
			const { container } = render(BaseText, {
				props: { truncate: true, maxLines: 1 },
				slots: { default: 'Длинный текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('base-text--truncate')).toBe(true)
		})

		it('не должен добавлять класс --truncate когда truncate=false', () => {
			const { container } = render(BaseText, {
				props: { truncate: false },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('base-text--truncate')).toBe(false)
		})

		it('должен применять инлайн-стиль -webkit-line-clamp когда maxLines > 1', () => {
			const { container } = render(BaseText, {
				props: { truncate: true, maxLines: 3 },
				slots: { default: 'Длинный текст' },
			})

			const style = container.querySelector('.base-text')?.getAttribute('style') ?? ''
			expect(style).toContain('-webkit-line-clamp: 3')
			expect(style).toContain('display: -webkit-box')
			expect(style).toContain('overflow: hidden')
		})

		it('не должен применять -webkit-line-clamp когда maxLines=1', () => {
			const { container } = render(BaseText, {
				props: { truncate: true, maxLines: 1 },
				slots: { default: 'Текст' },
			})

			const style = container.querySelector('.base-text')?.getAttribute('style') ?? ''
			expect(style).not.toContain('-webkit-line-clamp')
		})

		it('не должен применять -webkit-line-clamp когда truncate=false', () => {
			const { container } = render(BaseText, {
				props: { truncate: false, maxLines: 3 },
				slots: { default: 'Текст' },
			})

			const style = container.querySelector('.base-text')?.getAttribute('style') ?? ''
			expect(style).not.toContain('-webkit-line-clamp')
		})
	})

	describe('nowrap', () => {
		it('должен добавлять класс --nowrap когда nowrap=true', () => {
			const { container } = render(BaseText, {
				props: { nowrap: true },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('base-text--nowrap')).toBe(true)
		})

		it('не должен добавлять класс --nowrap когда nowrap=false', () => {
			const { container } = render(BaseText, {
				props: { nowrap: false },
				slots: { default: 'Текст' },
			})

			expect(container.querySelector('.base-text')?.classList.contains('base-text--nowrap')).toBe(false)
		})
	})

	describe('weight', () => {
		it('должен устанавливать font-weight через инлайн-стиль', () => {
			const { container } = render(BaseText, {
				props: { weight: 700 },
				slots: { default: 'Жирный текст' },
			})

			const style = container.querySelector('.base-text')?.getAttribute('style') ?? ''
			expect(style).toContain('font-weight: 700')
		})

		it('должен устанавливать font-weight: 400 по умолчанию', () => {
			const { container } = render(BaseText, {
				slots: { default: 'Обычный текст' },
			})

			const style = container.querySelector('.base-text')?.getAttribute('style') ?? ''
			expect(style).toContain('font-weight: 400')
		})
	})

	describe('комбинированные сценарии', () => {
		it('должен применять truncate и nowrap одновременно', () => {
			const { container } = render(BaseText, {
				props: { truncate: true, nowrap: true, maxLines: 1 },
				slots: { default: 'Текст' },
			})

			const el = container.querySelector('.base-text')!
			expect(el.classList.contains('base-text--truncate')).toBe(true)
			expect(el.classList.contains('base-text--nowrap')).toBe(true)
		})

		it('должен применять weight и truncate одновременно', () => {
			const { container } = render(BaseText, {
				props: { weight: 600, truncate: true, maxLines: 2 },
				slots: { default: 'Текст' },
			})

			const style = container.querySelector('.base-text')?.getAttribute('style') ?? ''
			expect(style).toContain('font-weight: 600')
			expect(style).toContain('-webkit-line-clamp: 2')
		})

		it('должен рендерить текстовое содержимое через слот', () => {
			render(BaseText, {
				slots: { default: 'Привет, мир!' },
			})

			expect(screen.getByText('Привет, мир!')).toBeInTheDocument()
		})
	})
})
