/**
 * Unit-тесты для BaseBadge.
 * Проверяют рендер, пропсы и CSS-модификаторы.
 */

import '@testing-library/jest-dom/vitest'
import { render, screen } from '@testing-library/vue'

import BaseBadge from './BaseBadge.vue'

describe('BaseBadge unit', () => {
	describe('рендер', () => {
		it('должен рендерить бейдж', () => {
			const { container } = render(BaseBadge)

			expect(container.querySelector('.base-badge')).toBeInTheDocument()
		})

		it('должен рендерить текст из пропса label', () => {
			render(BaseBadge, { props: { label: 'Новый' } })

			expect(screen.getByText('Новый')).toBeInTheDocument()
		})

		it('должен рендерить контент слота', () => {
			render(BaseBadge, { slots: { default: '<span>Слот</span>' } })

			expect(screen.getByText('Слот')).toBeInTheDocument()
		})
	})

	describe('пропс variant', () => {
		const variants = ['ghost', 'outline', 'shadow', 'soft'] as const

		variants.forEach(variant => {
			it(`должен применять модификатор --${variant}`, () => {
				const { container } = render(BaseBadge, { props: { variant } })

				expect(container.querySelector('.base-badge')?.classList.contains(`base-badge--${variant}`)).toBe(true)
			})
		})

		it('не должен добавлять модификатор для варианта default', () => {
			const { container } = render(BaseBadge)

			expect(container.querySelector('.base-badge')?.classList.contains('base-badge--default')).toBe(false)
		})
	})

	describe('пропс sizeScale', () => {
		it('не должен устанавливать --size-scale когда sizeScale=100', () => {
			const { container } = render(BaseBadge)

			const badge = container.querySelector('.base-badge') as HTMLElement
			expect(badge.style.getPropertyValue('--size-scale')).toBe('')
		})

		it('должен устанавливать --size-scale когда sizeScale=150', () => {
			const { container } = render(BaseBadge, { props: { sizeScale: 150 } })

			const badge = container.querySelector('.base-badge') as HTMLElement
			expect(badge.style.getPropertyValue('--size-scale')).toBe('1.5')
		})

		it('должен устанавливать --size-scale когда sizeScale=75', () => {
			const { container } = render(BaseBadge, { props: { sizeScale: 75 } })

			const badge = container.querySelector('.base-badge') as HTMLElement
			expect(badge.style.getPropertyValue('--size-scale')).toBe('0.75')
		})
	})

	describe('слот default', () => {
		it('должен заменять label содержимым слота', () => {
			render(BaseBadge, {
				props: { label: 'Текст пропса' },
				slots: { default: '<span>Кастомный слот</span>' },
			})

			expect(screen.getByText('Кастомный слот')).toBeInTheDocument()
			expect(screen.queryByText('Текст пропса')).not.toBeInTheDocument()
		})

		it('не должен рендерить BaseText когда передан слот', () => {
			const { container } = render(BaseBadge, {
				slots: { default: '<span>Слот</span>' },
			})

			expect(container.querySelector('.base-badge__text')).not.toBeInTheDocument()
		})
	})

	describe('emit click', () => {
		it('должен эмитить click при клике на бейдж', async () => {
			const { emitted, container } = render(BaseBadge)

			const badge = container.querySelector('.base-badge') as HTMLElement
			badge.dispatchEvent(new Event('click'))

			const clickEvents = emitted()['click']
			expect(clickEvents).toBeTruthy()
		})
	})

	describe('пропс customClass', () => {
		it('должен добавлять строку класса к корневому элементу', () => {
			const { container } = render(BaseBadge, {
				props: { customClass: 'my-custom-badge-class' },
			})

			expect(container.querySelector('.base-badge')?.classList.contains('my-custom-badge-class')).toBe(true)
		})

		it('должен распределять объект классов по внутренним элементам', () => {
			const { container } = render(BaseBadge, {
				props: {
					customClass: {
						root: 'my-badge-root',
						text: 'my-badge-text',
					},
					label: 'Бейдж',
				},
			})

			const root = container.querySelector('.base-badge')
			const text = container.querySelector('.base-badge__text')

			expect(root?.classList.contains('my-badge-root')).toBe(true)
			expect(text?.classList.contains('my-badge-text')).toBe(true)
		})
	})
})
